use crate::entry::VaultEntry;
use dashmap::DashMap;
use std::sync::Arc;
use tokio::time::{interval, Duration};

#[derive(Clone)]
pub struct InMemoryVault {
    entries: Arc<DashMap<String, VaultEntry>>,
}

impl Default for InMemoryVault {
    fn default() -> Self {
        Self::new()
    }
}

impl InMemoryVault {
    pub fn new() -> Self {
        let entries: Arc<DashMap<String, VaultEntry>> = Arc::new(DashMap::new());
        let entries_clone = Arc::clone(&entries);

        // Background reaper task to clean expired keys
        tokio::spawn(async move {
            let mut ticker = interval(Duration::from_secs(30));
            loop {
                ticker.tick().await;
                let mut expired_keys = Vec::new();
                for r in entries_clone.iter() {
                    if r.value().is_expired() {
                        expired_keys.push(r.key().clone());
                    }
                }
                for k in expired_keys {
                    entries_clone.remove(&k);
                }
            }
        });

        Self { entries }
    }

    pub fn insert(&self, entry: VaultEntry) {
        self.entries.insert(entry.handle.clone(), entry);
    }

    pub fn get(&self, handle: &str) -> Option<VaultEntry> {
        if let Some(r) = self.entries.get(handle) {
            if r.is_expired() {
                drop(r);
                self.entries.remove(handle);
                None
            } else {
                Some(r.clone())
            }
        } else {
            None
        }
    }

    pub fn remove(&self, handle: &str) -> Option<VaultEntry> {
        self.entries.remove(handle).map(|(_, v)| v)
    }

    pub fn len(&self) -> usize {
        self.entries.len()
    }

    pub fn is_empty(&self) -> bool {
        self.entries.is_empty()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_in_memory_vault_ttl() {
        let vault = InMemoryVault::new();
        let entry = VaultEntry::new(
            "sgh_test_handle",
            "anthropic",
            "provider_sig_abc",
            "tenant-1",
            "user-1",
            "sess-1",
            1,
            "claude-opus-4.8",
            1, // 1 second TTL
        );

        vault.insert(entry);
        assert!(vault.get("sgh_test_handle").is_some());

        // Wait for TTL expiration
        tokio::time::sleep(Duration::from_millis(1100)).await;
        assert!(vault.get("sgh_test_handle").is_none());
    }
}
