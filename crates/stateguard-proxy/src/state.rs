use crate::config::ProxyConfig;
use crate::models::{SecurityEvent, SessionRecord};
use dashmap::DashMap;
use stateguard_scanner::Redactor;
use stateguard_vault::{InMemoryVault, RedisVault, StateVault, VaultBackend};
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Clone)]
pub struct AppState {
    pub config: Arc<ProxyConfig>,
    pub vault: Arc<dyn StateVault>,
    pub redactor: Redactor,
    pub sessions: Arc<DashMap<String, SessionRecord>>,
    pub events: Arc<RwLock<Vec<SecurityEvent>>>,
    pub tenant_keys: Arc<DashMap<String, [u8; 32]>>,
    pub client: reqwest::Client,
}

impl AppState {
    pub async fn new(config: ProxyConfig) -> Self {
        let vault: Arc<dyn StateVault> = if let Some(ref redis_url) = config.redis_url {
            match RedisVault::new(redis_url).await {
                Ok(redis) => {
                    tracing::info!("Connected to Redis ephemeral state vault at {}", redis_url);
                    Arc::new(VaultBackend::Redis(redis))
                }
                Err(e) => {
                    tracing::warn!(
                        "Failed to connect to Redis ({}), falling back to in-memory vault",
                        e
                    );
                    Arc::new(VaultBackend::Memory(InMemoryVault::new()))
                }
            }
        } else {
            Arc::new(VaultBackend::Memory(InMemoryVault::new()))
        };

        let tenant_keys = Arc::new(DashMap::new());
        // Default tenant key
        tenant_keys.insert("default-tenant".to_string(), config.default_tenant_key);
        tenant_keys.insert("tenant-1".to_string(), config.default_tenant_key);
        tenant_keys.insert("tenant-alpha".to_string(), config.default_tenant_key);
        tenant_keys.insert(
            "00000000-0000-0000-0000-000000000001".to_string(),
            config.default_tenant_key,
        );

        Self {
            config: Arc::new(config),
            vault,
            redactor: Redactor::new(),
            sessions: Arc::new(DashMap::new()),
            events: Arc::new(RwLock::new(Vec::new())),
            tenant_keys,
            client: reqwest::Client::builder().build().unwrap(),
        }
    }

    pub async fn record_event(&self, event: SecurityEvent) {
        tracing::warn!(
            "SECURITY EVENT [{}]: type={}, tenant={}, session={:?}",
            event.severity,
            event.event_type,
            event.tenant_id,
            event.session_id
        );
        let mut evs = self.events.write().await;
        evs.push(event);
    }
}
