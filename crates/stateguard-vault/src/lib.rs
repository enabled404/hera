pub mod entry;
pub mod handle;
pub mod memory;
pub mod redis_store;

pub use entry::VaultEntry;
pub use handle::{generate_token_handle, is_token_handle};
pub use memory::InMemoryVault;
pub use redis_store::RedisVault;

use async_trait::async_trait;

#[async_trait]
pub trait StateVault: Send + Sync {
    async fn store(&self, entry: VaultEntry) -> Result<(), String>;
    async fn retrieve(&self, handle: &str) -> Result<Option<VaultEntry>, String>;
    async fn delete(&self, handle: &str) -> Result<(), String>;
}

#[derive(Clone)]
pub enum VaultBackend {
    Memory(InMemoryVault),
    Redis(RedisVault),
}

#[async_trait]
impl StateVault for VaultBackend {
    async fn store(&self, entry: VaultEntry) -> Result<(), String> {
        match self {
            VaultBackend::Memory(mem) => {
                mem.insert(entry);
                Ok(())
            }
            VaultBackend::Redis(redis) => redis
                .insert(&entry)
                .await
                .map_err(|e| e.to_string()),
        }
    }

    async fn retrieve(&self, handle: &str) -> Result<Option<VaultEntry>, String> {
        match self {
            VaultBackend::Memory(mem) => Ok(mem.get(handle)),
            VaultBackend::Redis(redis) => redis
                .get(handle)
                .await
                .map_err(|e| e.to_string()),
        }
    }

    async fn delete(&self, handle: &str) -> Result<(), String> {
        match self {
            VaultBackend::Memory(mem) => {
                mem.remove(handle);
                Ok(())
            }
            VaultBackend::Redis(redis) => redis
                .remove(handle)
                .await
                .map_err(|e| e.to_string()),
        }
    }
}
