use aes_gcm::{
    aead::{Aead, KeyInit, Payload},
    Aes256Gcm, Nonce as AesNonce,
};
use base64::engine::general_purpose::STANDARD as BASE64;
use base64::Engine;
use chacha20poly1305::{ChaCha20Poly1305, Nonce as ChaChaNonce};
use rand::RngCore;
use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Error, Debug)]
pub enum CryptoError {
    #[error("Decryption failed: cryptographic context mismatch or tampered ciphertext")]
    DecryptionFailed,
    #[error("Invalid key length: expected 32 bytes")]
    InvalidKeyLength,
    #[error("Base64 decode error: {0}")]
    Base64Error(#[from] base64::DecodeError),
    #[error("Serialization error: {0}")]
    SerializationError(#[from] serde_json::Error),
    #[error("Turn ordinality violation: expected turn > {current}, received {received}")]
    TurnOrdinalityViolation { current: u64, received: u64 },
    #[error("Chain verification failed: HMAC mismatch at turn {turn_index}")]
    ChainMismatch { turn_index: u64 },
    #[error("Model lineage mismatch: bound to '{bound_model}', attempted use on '{target_model}'")]
    ModelMismatch {
        bound_model: String,
        target_model: String,
    },
    #[error("Tenant mismatch: bound to '{bound_tenant}', attempted use on '{target_tenant}'")]
    TenantMismatch {
        bound_tenant: String,
        target_tenant: String,
    },
    #[error("User mismatch: bound to '{bound_user}', attempted use on '{target_user}'")]
    UserMismatch {
        bound_user: String,
        target_user: String,
    },
    #[error("Session mismatch: bound to '{bound_session}', attempted use on '{target_session}'")]
    SessionMismatch {
        bound_session: String,
        target_session: String,
    },
    #[error("Branch mismatch: bound to '{bound_branch}', attempted use on '{target_branch}'")]
    BranchMismatch {
        bound_branch: String,
        target_branch: String,
    },
    #[error("Merkle proof verification failed for root {0}")]
    MerkleProofInvalid(String),
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum CipherSuite {
    Aes256Gcm,
    ChaCha20Poly1305,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ContextBinding {
    pub tenant_id: String,
    pub user_id: String,
    pub session_id: String,
    pub branch_id: String,
    pub turn_index: u64,
    pub model_id: String,
}

impl ContextBinding {
    pub fn new(
        tenant_id: impl Into<String>,
        user_id: impl Into<String>,
        session_id: impl Into<String>,
        turn_index: u64,
        model_id: impl Into<String>,
    ) -> Self {
        Self::new_with_branch(tenant_id, user_id, session_id, "main", turn_index, model_id)
    }

    pub fn new_with_branch(
        tenant_id: impl Into<String>,
        user_id: impl Into<String>,
        session_id: impl Into<String>,
        branch_id: impl Into<String>,
        turn_index: u64,
        model_id: impl Into<String>,
    ) -> Self {
        Self {
            tenant_id: tenant_id.into(),
            user_id: user_id.into(),
            session_id: session_id.into(),
            branch_id: branch_id.into(),
            turn_index,
            model_id: model_id.into(),
        }
    }

    /// Compute canonical associated data (AD):
    /// AD = tenant_id || user_id || session_id || branch_id || turn_index || model_id
    /// Encoded with length-prefixes to avoid canonical collision vulnerabilities.
    pub fn canonical_associated_data(&self) -> Vec<u8> {
        let mut ad = Vec::new();
        let turn_str = self.turn_index.to_string();
        for field in [
            &self.tenant_id,
            &self.user_id,
            &self.session_id,
            &self.branch_id,
            &turn_str,
            &self.model_id,
        ] {
            let bytes = field.as_bytes();
            ad.extend_from_slice(&(bytes.len() as u32).to_be_bytes());
            ad.extend_from_slice(bytes);
        }
        ad
    }

    pub fn matches(&self, other: &ContextBinding) -> Result<(), CryptoError> {
        if self.tenant_id != other.tenant_id {
            return Err(CryptoError::TenantMismatch {
                bound_tenant: self.tenant_id.clone(),
                target_tenant: other.tenant_id.clone(),
            });
        }
        if self.user_id != other.user_id {
            return Err(CryptoError::UserMismatch {
                bound_user: self.user_id.clone(),
                target_user: other.user_id.clone(),
            });
        }
        if self.session_id != other.session_id {
            return Err(CryptoError::SessionMismatch {
                bound_session: self.session_id.clone(),
                target_session: other.session_id.clone(),
            });
        }
        if self.branch_id != other.branch_id {
            return Err(CryptoError::BranchMismatch {
                bound_branch: self.branch_id.clone(),
                target_branch: other.branch_id.clone(),
            });
        }
        if self.model_id != other.model_id {
            return Err(CryptoError::ModelMismatch {
                bound_model: self.model_id.clone(),
                target_model: other.model_id.clone(),
            });
        }
        if other.turn_index <= self.turn_index {
            return Err(CryptoError::TurnOrdinalityViolation {
                current: self.turn_index,
                received: other.turn_index,
            });
        }
        Ok(())
    }

    /// Verifies if bound model state can be safely re-used or migrated to a target model without downgrade.
    pub fn is_lineage_compatible(&self, target_model: &str) -> bool {
        is_model_compatible(&self.model_id, target_model)
    }
}

/// Checks if reasoning state from model A can be executed on model B according to frontier lineage rules.
pub fn is_model_compatible(bound_model: &str, target_model: &str) -> bool {
    let b = bound_model.to_lowercase();
    let t = target_model.to_lowercase();

    if b == t {
        return true;
    }

    // Disallow Opus / Fable -> Haiku downgrade (e.g., claude-fable-5-1, claude-opus-4-8 -> claude-haiku-4-5)
    if (b.contains("opus") || b.contains("fable")) && t.contains("haiku") {
        return false;
    }

    // Disallow OpenAI frontier (Astra / Sol / Luna / GPT-5 / o1 / o3) -> mini/nano downgrade
    if (b.contains("astra")
        || b.contains("sol")
        || b.contains("luna")
        || b.contains("gpt-5")
        || b.contains("o1")
        || b.contains("o3"))
        && (t.contains("mini") || t.contains("nano"))
    {
        return false;
    }

    // Disallow Gemini Pro / Ultra / Robotics -> Flash downgrade (e.g. gemini-3-pro, gemini-robotics-1-6 -> gemini-3-8-flash)
    if (b.contains("pro") || b.contains("ultra") || b.contains("robotics"))
        && t.contains("flash")
    {
        return false;
    }

    // Require matching model family
    let b_family = extract_model_family(&b);
    let t_family = extract_model_family(&t);
    b_family == t_family
}

pub fn extract_model_family(model: &str) -> &'static str {
    if model.contains("claude") || model.contains("fable") {
        "claude"
    } else if model.contains("gpt")
        || model.contains("o1")
        || model.contains("o3")
        || model.contains("astra")
        || model.contains("sol")
        || model.contains("luna")
        || model.contains("openai")
    {
        "openai"
    } else if model.contains("gemini") || model.contains("robotics") {
        "gemini"
    } else {
        "unknown"
    }
}

/// Cryptographically bound outer envelope wrapping provider reasoning tokens.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct BoundEnvelope {
    pub version: u8,
    pub cipher_suite: CipherSuite,
    pub context: ContextBinding,
    pub nonce: String,
    pub ciphertext: String,
    pub chain_tag: String,
}

impl BoundEnvelope {
    pub fn to_opaque_string(&self) -> Result<String, CryptoError> {
        let json = serde_json::to_vec(self)?;
        Ok(BASE64.encode(json))
    }

    pub fn from_opaque_string(s: &str) -> Result<Self, CryptoError> {
        let decoded = BASE64.decode(s.trim())?;
        let envelope: BoundEnvelope = serde_json::from_slice(&decoded)?;
        Ok(envelope)
    }
}

pub struct AeadEnvelopeHandler;

impl AeadEnvelopeHandler {
    pub fn encrypt(
        key: &[u8; 32],
        suite: CipherSuite,
        context: ContextBinding,
        plaintext: &[u8],
        chain_tag: &str,
    ) -> Result<BoundEnvelope, CryptoError> {
        let ad = context.canonical_associated_data();

        let (nonce_bytes, ciphertext) = match suite {
            CipherSuite::Aes256Gcm => {
                let cipher = Aes256Gcm::new_from_slice(key)
                    .map_err(|_| CryptoError::InvalidKeyLength)?;
                let mut nonce = [0u8; 12];
                rand::thread_rng().fill_bytes(&mut nonce);
                let nonce_obj = AesNonce::from_slice(&nonce);
                let payload = Payload {
                    msg: plaintext,
                    aad: &ad,
                };
                let ct = cipher
                    .encrypt(nonce_obj, payload)
                    .map_err(|_| CryptoError::DecryptionFailed)?;
                (nonce.to_vec(), ct)
            }
            CipherSuite::ChaCha20Poly1305 => {
                let cipher = ChaCha20Poly1305::new_from_slice(key)
                    .map_err(|_| CryptoError::InvalidKeyLength)?;
                let mut nonce = [0u8; 12];
                rand::thread_rng().fill_bytes(&mut nonce);
                let nonce_obj = ChaChaNonce::from_slice(&nonce);
                let payload = Payload {
                    msg: plaintext,
                    aad: &ad,
                };
                let ct = cipher
                    .encrypt(nonce_obj, payload)
                    .map_err(|_| CryptoError::DecryptionFailed)?;
                (nonce.to_vec(), ct)
            }
        };

        Ok(BoundEnvelope {
            version: 1,
            cipher_suite: suite,
            context,
            nonce: BASE64.encode(nonce_bytes),
            ciphertext: BASE64.encode(ciphertext),
            chain_tag: chain_tag.to_string(),
        })
    }

    pub fn decrypt(
        key: &[u8; 32],
        envelope: &BoundEnvelope,
        expected_context: &ContextBinding,
    ) -> Result<Vec<u8>, CryptoError> {
        // Enforce strict context matching (tenant, user, session, turn, model)
        if envelope.context.tenant_id != expected_context.tenant_id {
            return Err(CryptoError::TenantMismatch {
                bound_tenant: envelope.context.tenant_id.clone(),
                target_tenant: expected_context.tenant_id.clone(),
            });
        }
        if envelope.context.user_id != expected_context.user_id {
            return Err(CryptoError::UserMismatch {
                bound_user: envelope.context.user_id.clone(),
                target_user: expected_context.user_id.clone(),
            });
        }
        if envelope.context.session_id != expected_context.session_id {
            return Err(CryptoError::SessionMismatch {
                bound_session: envelope.context.session_id.clone(),
                target_session: expected_context.session_id.clone(),
            });
        }
        if envelope.context.branch_id != expected_context.branch_id {
            return Err(CryptoError::BranchMismatch {
                bound_branch: envelope.context.branch_id.clone(),
                target_branch: expected_context.branch_id.clone(),
            });
        }
        if envelope.context.model_id != expected_context.model_id {
            return Err(CryptoError::ModelMismatch {
                bound_model: envelope.context.model_id.clone(),
                target_model: expected_context.model_id.clone(),
            });
        }
        if envelope.context.turn_index != expected_context.turn_index {
            return Err(CryptoError::TurnOrdinalityViolation {
                current: expected_context.turn_index,
                received: envelope.context.turn_index,
            });
        }

        let nonce_bytes = BASE64.decode(&envelope.nonce)?;
        let ciphertext_bytes = BASE64.decode(&envelope.ciphertext)?;
        let ad = envelope.context.canonical_associated_data();

        match envelope.cipher_suite {
            CipherSuite::Aes256Gcm => {
                let cipher = Aes256Gcm::new_from_slice(key)
                    .map_err(|_| CryptoError::InvalidKeyLength)?;
                let nonce_obj = AesNonce::from_slice(&nonce_bytes);
                let payload = Payload {
                    msg: &ciphertext_bytes,
                    aad: &ad,
                };
                cipher
                    .decrypt(nonce_obj, payload)
                    .map_err(|_| CryptoError::DecryptionFailed)
            }
            CipherSuite::ChaCha20Poly1305 => {
                let cipher = ChaCha20Poly1305::new_from_slice(key)
                    .map_err(|_| CryptoError::InvalidKeyLength)?;
                let nonce_obj = ChaChaNonce::from_slice(&nonce_bytes);
                let payload = Payload {
                    msg: &ciphertext_bytes,
                    aad: &ad,
                };
                cipher
                    .decrypt(nonce_obj, payload)
                    .map_err(|_| CryptoError::DecryptionFailed)
            }
        }
    }
}
