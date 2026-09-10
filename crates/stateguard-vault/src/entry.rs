use aes_gcm::{
    aead::{Aead, KeyInit, Payload},
    Aes256Gcm, Nonce as AesNonce,
};
use base64::engine::general_purpose::STANDARD as BASE64;
use base64::Engine;
use rand::RngCore;
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum VaultEntryError {
    #[error("Encryption error: {0}")]
    EncryptionFailed(String),
    #[error("Decryption error: invalid key or corrupted fallback token")]
    DecryptionFailed,
    #[error("Serialization error: {0}")]
    SerializationError(#[from] serde_json::Error),
    #[error("Base64 error: {0}")]
    Base64Error(#[from] base64::DecodeError),
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct VaultEntry {
    pub handle: String,
    pub provider: String,
    pub original_envelope: String,
    pub tenant_id: String,
    pub user_id: String,
    pub session_id: String,
    pub branch_id: String,
    pub turn_index: u64,
    pub model_id: String,
    pub created_at_ms: u64,
    pub ttl_seconds: u64,
}

impl VaultEntry {
    pub fn new(
        handle: impl Into<String>,
        provider: impl Into<String>,
        original_envelope: impl Into<String>,
        tenant_id: impl Into<String>,
        user_id: impl Into<String>,
        session_id: impl Into<String>,
        turn_index: u64,
        model_id: impl Into<String>,
        ttl_seconds: u64,
    ) -> Self {
        Self::new_with_branch(
            handle,
            provider,
            original_envelope,
            tenant_id,
            user_id,
            session_id,
            "main",
            turn_index,
            model_id,
            ttl_seconds,
        )
    }

    pub fn new_with_branch(
        handle: impl Into<String>,
        provider: impl Into<String>,
        original_envelope: impl Into<String>,
        tenant_id: impl Into<String>,
        user_id: impl Into<String>,
        session_id: impl Into<String>,
        branch_id: impl Into<String>,
        turn_index: u64,
        model_id: impl Into<String>,
        ttl_seconds: u64,
    ) -> Self {
        let created_at_ms = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64;

        Self {
            handle: handle.into(),
            provider: provider.into(),
            original_envelope: original_envelope.into(),
            tenant_id: tenant_id.into(),
            user_id: user_id.into(),
            session_id: session_id.into(),
            branch_id: branch_id.into(),
            turn_index,
            model_id: model_id.into(),
            created_at_ms,
            ttl_seconds,
        }
    }

    pub fn is_expired(&self) -> bool {
        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64;
        now > (self.created_at_ms + (self.ttl_seconds * 1000))
    }

    /// Creates an authenticated AES-256-GCM encapsulated fallback token:
    /// EncapsulatedState = AES-256-GCM_{K_tenant}(signature || session_metadata)
    /// Emitted in HTTP response header: X-StateGuard-Encapsulated-Fallback
    pub fn create_encapsulated_fallback(&self, tenant_key: &[u8; 32]) -> Result<String, VaultEntryError> {
        let cipher = Aes256Gcm::new_from_slice(tenant_key)
            .map_err(|e| VaultEntryError::EncryptionFailed(e.to_string()))?;

        let mut nonce_bytes = [0u8; 12];
        rand::thread_rng().fill_bytes(&mut nonce_bytes);
        let nonce = AesNonce::from_slice(&nonce_bytes);

        let plaintext = serde_json::to_vec(self)?;
        let aad = format!(
            "{}:{}:{}:{}",
            self.tenant_id, self.session_id, self.branch_id, self.turn_index
        );

        let ciphertext = cipher
            .encrypt(
                nonce,
                Payload {
                    msg: &plaintext,
                    aad: aad.as_bytes(),
                },
            )
            .map_err(|e| VaultEntryError::EncryptionFailed(e.to_string()))?;

        let mut payload = Vec::with_capacity(12 + ciphertext.len());
        payload.extend_from_slice(&nonce_bytes);
        payload.extend_from_slice(&ciphertext);

        Ok(BASE64.encode(&payload))
    }

    /// Decrypts and authenticates an EncapsulatedState fallback token, verifying session binding
    pub fn restore_from_encapsulated(
        fallback_b64: &str,
        tenant_key: &[u8; 32],
        expected_tenant_id: &str,
        expected_session_id: &str,
        expected_branch_id: &str,
    ) -> Result<Self, VaultEntryError> {
        let payload = BASE64.decode(fallback_b64.trim())?;
        if payload.len() < 12 {
            return Err(VaultEntryError::DecryptionFailed);
        }

        let (nonce_bytes, ciphertext) = payload.split_at(12);
        let cipher = Aes256Gcm::new_from_slice(tenant_key)
            .map_err(|_| VaultEntryError::DecryptionFailed)?;
        let nonce = AesNonce::from_slice(nonce_bytes);

        let mut decrypted_bytes = None;
        let branches_to_try = if expected_branch_id != "main" && expected_branch_id != "branch_main" {
            vec![expected_branch_id, "main", "branch_main"]
        } else {
            vec![expected_branch_id]
        };

        for b in branches_to_try {
            let aad_prefix = format!("{}:{}:{}:", expected_tenant_id, expected_session_id, b);
            for turn in 0..1000 {
                let trial_aad = format!("{}{}", aad_prefix, turn);
                if let Ok(pt) = cipher.decrypt(
                    nonce,
                    Payload {
                        msg: ciphertext,
                        aad: trial_aad.as_bytes(),
                    },
                ) {
                    decrypted_bytes = Some(pt);
                    break;
                }
            }
            if decrypted_bytes.is_some() {
                break;
            }
        }

        let pt = decrypted_bytes.ok_or(VaultEntryError::DecryptionFailed)?;
        let entry: VaultEntry = serde_json::from_slice(&pt)?;

        let is_branch_valid = entry.branch_id == expected_branch_id
            || entry.branch_id == "main"
            || entry.branch_id == "branch_main";

        // Verify bounds
        if entry.tenant_id != expected_tenant_id
            || entry.session_id != expected_session_id
            || !is_branch_valid
        {
            return Err(VaultEntryError::DecryptionFailed);
        }

        Ok(entry)
    }
}
