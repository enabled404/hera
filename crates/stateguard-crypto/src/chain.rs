use crate::aead::CryptoError;
use hmac::{Hmac, Mac};
use sha2::{Digest, Sha256};

type HmacSha256 = Hmac<Sha256>;

const DOMAIN_SALT_1: &[u8] = b"STATEGUARD_CHAIN_SALT_1_CONTEXT_BINDING_V1";
const DOMAIN_SALT_2: &[u8] = b"STATEGUARD_CHAIN_SALT_2_REASONING_HASH_V1";

#[derive(Debug, Clone)]
pub struct ChainState {
    pub tenant_key: [u8; 32],
    pub user_id: String,
    pub session_id: String,
    pub current_turn: u64,
    pub current_tag: Vec<u8>,
}

impl ChainState {
    pub fn new(
        tenant_key: [u8; 32],
        user_id: impl Into<String>,
        session_id: impl Into<String>,
    ) -> Self {
        let user_id = user_id.into();
        let session_id = session_id.into();

        // Initial base chain tag tau_0
        let mut mac =
            HmacSha256::new_from_slice(&tenant_key).expect("HMAC can take key of any size");
        mac.update(user_id.as_bytes());
        mac.update(b":");
        mac.update(session_id.as_bytes());
        mac.update(b":init:");
        mac.update(DOMAIN_SALT_1);
        let current_tag = mac.finalize().into_bytes().to_vec();

        Self {
            tenant_key,
            user_id,
            session_id,
            current_turn: 0,
            current_tag,
        }
    }

    /// Advances the chain to next turn (turn_{n+1} > turn_n) and computes:
    /// tau_{n+1} = HMAC-SHA256(K_tenant, user_id || session_id || H(tau_n || salt_2) || salt_1)
    pub fn advance_turn(
        &mut self,
        next_turn: u64,
    ) -> Result<Vec<u8>, CryptoError> {
        if next_turn <= self.current_turn {
            return Err(CryptoError::TurnOrdinalityViolation {
                current: self.current_turn,
                received: next_turn,
            });
        }

        // H(tau_n || salt_2)
        let mut hasher = Sha256::new();
        hasher.update(&self.current_tag);
        hasher.update(DOMAIN_SALT_2);
        let tau_n_hash = hasher.finalize();

        // tau_{n+1} = HMAC-SHA256(K_tenant, user_id || session_id || H(tau_n || salt_2) || salt_1)
        let mut mac =
            HmacSha256::new_from_slice(&self.tenant_key).expect("HMAC can take key of any size");
        mac.update(self.user_id.as_bytes());
        mac.update(self.session_id.as_bytes());
        mac.update(&tau_n_hash);
        mac.update(DOMAIN_SALT_1);
        let next_tag = mac.finalize().into_bytes().to_vec();

        self.current_turn = next_turn;
        self.current_tag = next_tag.clone();
        Ok(next_tag)
    }

    /// Verifies that a received tag matches the expected progression from tau_n to tau_{n+1}
    pub fn verify_next_turn(
        &self,
        received_turn: u64,
        received_tag: &[u8],
    ) -> Result<(), CryptoError> {
        if received_turn <= self.current_turn {
            return Err(CryptoError::TurnOrdinalityViolation {
                current: self.current_turn,
                received: received_turn,
            });
        }

        let mut hasher = Sha256::new();
        hasher.update(&self.current_tag);
        hasher.update(DOMAIN_SALT_2);
        let tau_n_hash = hasher.finalize();

        let mut mac =
            HmacSha256::new_from_slice(&self.tenant_key).expect("HMAC can take key of any size");
        mac.update(self.user_id.as_bytes());
        mac.update(self.session_id.as_bytes());
        mac.update(&tau_n_hash);
        mac.update(DOMAIN_SALT_1);

        mac.verify_slice(received_tag)
            .map_err(|_| CryptoError::ChainMismatch {
                turn_index: received_turn,
            })
    }
}
