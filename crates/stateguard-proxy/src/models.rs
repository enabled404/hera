use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ProxyMode {
    StatefulVault,
    StatelessBinding,
}

impl Default for ProxyMode {
    fn default() -> Self {
        Self::StatefulVault
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SecurityEvent {
    pub id: Uuid,
    pub tenant_id: String,
    pub session_id: Option<String>,
    pub event_type: String, // 'CROSS_USER_REPLAY', 'MODEL_MISMATCH', 'SECRET_IN_STATE', 'INJECTION_ATTEMPT'
    pub severity: String,   // 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    pub payload_fingerprint: Option<String>,
    pub metadata: serde_json::Value,
    pub created_at: DateTime<Utc>,
}

impl SecurityEvent {
    pub fn new(
        tenant_id: impl Into<String>,
        session_id: Option<String>,
        event_type: impl Into<String>,
        severity: impl Into<String>,
        payload_fingerprint: Option<String>,
        metadata: serde_json::Value,
    ) -> Self {
        Self {
            id: Uuid::new_v4(),
            tenant_id: tenant_id.into(),
            session_id,
            event_type: event_type.into(),
            severity: severity.into(),
            payload_fingerprint,
            metadata,
            created_at: Utc::now(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SessionRecord {
    pub id: Uuid,
    pub tenant_id: String,
    pub external_session_id: String,
    pub bound_user_id: String,
    pub model_family: String,
    pub current_turn: u64,
    pub merkle_root: Option<String>,
    pub last_active: DateTime<Utc>,
}
