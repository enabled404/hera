use crate::entry::VaultEntry;
use redis::aio::ConnectionManager;
use redis::AsyncCommands;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum RedisVaultError {
    #[error("Redis client error: {0}")]
    RedisError(#[from] redis::RedisError),
    #[error("Serialization error: {0}")]
    SerializationError(#[from] serde_json::Error),
}

#[derive(Clone)]
pub struct RedisVault {
    manager: ConnectionManager,
    key_prefix: String,
}

impl RedisVault {
    pub async fn new(redis_url: &str) -> Result<Self, RedisVaultError> {
        let client = redis::Client::open(redis_url)?;
        let manager = ConnectionManager::new(client).await?;
        Ok(Self {
            manager,
            key_prefix: "stateguard:vault:".to_string(),
        })
    }

    pub fn with_prefix(mut self, prefix: impl Into<String>) -> Self {
        self.key_prefix = prefix.into();
        self
    }

    fn format_key(&self, handle: &str) -> String {
        format!("{}{}", self.key_prefix, handle)
    }

    pub async fn insert(&self, entry: &VaultEntry) -> Result<(), RedisVaultError> {
        let mut conn = self.manager.clone();
        let key = self.format_key(&entry.handle);
        let serialized = serde_json::to_string(entry)?;

        let () = conn
            .set_ex(key, serialized, entry.ttl_seconds)
            .await?;
        Ok(())
    }

    pub async fn get(&self, handle: &str) -> Result<Option<VaultEntry>, RedisVaultError> {
        let mut conn = self.manager.clone();
        let key = self.format_key(handle);

        let data: Option<String> = conn.get(key).await?;
        if let Some(json_str) = data {
            let entry = serde_json::from_str(&json_str)?;
            Ok(Some(entry))
        } else {
            Ok(None)
        }
    }

    pub async fn remove(&self, handle: &str) -> Result<(), RedisVaultError> {
        let mut conn = self.manager.clone();
        let key = self.format_key(handle);
        let () = conn.del(key).await?;
        Ok(())
    }
}
