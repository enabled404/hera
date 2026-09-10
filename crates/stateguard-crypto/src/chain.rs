use crate::aead::CryptoError;
use hmac::{Hmac, Mac};
use sha2::{Digest, Sha256};
use std::collections::HashMap;

type HmacSha256 = Hmac<Sha256>;

const DOMAIN_SALT_1: &[u8] = b"STATEGUARD_CHAIN_SALT_1_CONTEXT_BINDING_V1";
const DOMAIN_SALT_2: &[u8] = b"STATEGUARD_CHAIN_SALT_2_REASONING_HASH_V1";
const DOMAIN_SALT_FORK: &[u8] = b"STATEGUARD_CHAIN_SALT_FORK_DERIVATION_V1";

#[derive(Debug, Clone)]
pub struct ChainState {
    pub tenant_key: [u8; 32],
    pub user_id: String,
    pub session_id: String,
    pub branch_id: String,
    pub current_turn: u64,
    pub current_tag: Vec<u8>,
}

impl ChainState {
    pub fn new(
        tenant_key: [u8; 32],
        user_id: impl Into<String>,
        session_id: impl Into<String>,
    ) -> Self {
        Self::new_with_branch(tenant_key, user_id, session_id, "main")
    }

    pub fn new_with_branch(
        tenant_key: [u8; 32],
        user_id: impl Into<String>,
        session_id: impl Into<String>,
        branch_id: impl Into<String>,
    ) -> Self {
        let user_id = user_id.into();
        let session_id = session_id.into();
        let branch_id = branch_id.into();

        // Initial base chain tag tau_0
        let mut mac =
            HmacSha256::new_from_slice(&tenant_key).expect("HMAC can take key of any size");
        mac.update(user_id.as_bytes());
        mac.update(b":");
        mac.update(session_id.as_bytes());
        mac.update(b":");
        mac.update(branch_id.as_bytes());
        mac.update(b":init:");
        mac.update(DOMAIN_SALT_1);
        let current_tag = mac.finalize().into_bytes().to_vec();

        Self {
            tenant_key,
            user_id,
            session_id,
            branch_id,
            current_turn: 0,
            current_tag,
        }
    }

    /// Derives a child branch from the current validated turn without causing
    /// sequence monotonicity conflicts across sibling branches.
    pub fn fork_branch(&self, new_branch_id: impl Into<String>) -> Self {
        let new_branch_id = new_branch_id.into();

        // Derive branch child tag: HMAC(K, parent_tag || new_branch_id || DOMAIN_SALT_FORK)
        let mut mac =
            HmacSha256::new_from_slice(&self.tenant_key).expect("HMAC can take key of any size");
        mac.update(&self.current_tag);
        mac.update(b":fork:");
        mac.update(new_branch_id.as_bytes());
        mac.update(DOMAIN_SALT_FORK);
        let child_tag = mac.finalize().into_bytes().to_vec();

        Self {
            tenant_key: self.tenant_key,
            user_id: self.user_id.clone(),
            session_id: self.session_id.clone(),
            branch_id: new_branch_id,
            current_turn: self.current_turn,
            current_tag: child_tag,
        }
    }

    /// Advances the chain to next turn (turn_{n+1} > turn_n) and computes:
    /// tau_{n+1} = HMAC-SHA256(K_tenant, user_id || session_id || branch_id || H(tau_n || salt_2) || salt_1)
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

        // tau_{n+1} = HMAC-SHA256(K_tenant, user_id || session_id || branch_id || H(tau_n || salt_2) || salt_1)
        let mut mac =
            HmacSha256::new_from_slice(&self.tenant_key).expect("HMAC can take key of any size");
        mac.update(self.user_id.as_bytes());
        mac.update(self.session_id.as_bytes());
        mac.update(self.branch_id.as_bytes());
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
        mac.update(self.branch_id.as_bytes());
        mac.update(&tau_n_hash);
        mac.update(DOMAIN_SALT_1);

        mac.verify_slice(received_tag)
            .map_err(|_| CryptoError::ChainMismatch {
                turn_index: received_turn,
            })
    }
}

/// DAG branch tracker maintaining sequence tracking keyed on (session_id, branch_id)
#[derive(Debug, Clone)]
pub struct DagChainTracker {
    tenant_key: [u8; 32],
    branches: HashMap<(String, String), ChainState>, // (session_id, branch_id) -> ChainState
}

impl DagChainTracker {
    pub fn new(tenant_key: [u8; 32]) -> Self {
        Self {
            tenant_key,
            branches: HashMap::new(),
        }
    }

    pub fn get_or_create(
        &mut self,
        user_id: &str,
        session_id: &str,
        branch_id: &str,
    ) -> &mut ChainState {
        let key = (session_id.to_string(), branch_id.to_string());
        self.branches.entry(key).or_insert_with(|| {
            ChainState::new_with_branch(self.tenant_key, user_id, session_id, branch_id)
        })
    }

    pub fn fork(
        &mut self,
        user_id: &str,
        session_id: &str,
        parent_branch_id: &str,
        child_branch_id: &str,
    ) -> Result<ChainState, CryptoError> {
        let parent_key = (session_id.to_string(), parent_branch_id.to_string());
        let parent_state = self
            .branches
            .entry(parent_key)
            .or_insert_with(|| {
                ChainState::new_with_branch(self.tenant_key, user_id, session_id, parent_branch_id)
            })
            .clone();

        let child_state = parent_state.fork_branch(child_branch_id);
        let child_key = (session_id.to_string(), child_branch_id.to_string());
        self.branches.insert(child_key, child_state.clone());
        Ok(child_state)
    }
}
