use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct VaultEntry {
    pub handle: String,
    pub provider: String,
    pub original_envelope: String,
    pub tenant_id: String,
    pub user_id: String,
    pub session_id: String,
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
}
