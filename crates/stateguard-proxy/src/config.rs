use crate::models::ProxyMode;
use std::env;

#[derive(Debug, Clone)]
pub struct ProxyConfig {
    pub host: String,
    pub port: u16,
    pub mode: ProxyMode,
    pub anthropic_upstream_url: String,
    pub openai_upstream_url: String,
    pub gemini_upstream_url: String,
    pub default_tenant_key: [u8; 32],
    pub redis_url: Option<String>,
}

impl Default for ProxyConfig {
    fn default() -> Self {
        let host = env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string());
        let port = env::var("PORT")
            .ok()
            .and_then(|p| p.parse().ok())
            .unwrap_or(8080);

        let mode = match env::var("STATEGUARD_MODE").as_deref() {
            Ok("STATELESS_BINDING") => ProxyMode::StatelessBinding,
            _ => ProxyMode::StatefulVault,
        };

        let anthropic_upstream_url = env::var("ANTHROPIC_UPSTREAM_URL")
            .unwrap_or_else(|_| "https://api.anthropic.com".to_string());
        let openai_upstream_url = env::var("OPENAI_UPSTREAM_URL")
            .unwrap_or_else(|_| "https://api.openai.com".to_string());
        let gemini_upstream_url = env::var("GEMINI_UPSTREAM_URL")
            .unwrap_or_else(|_| "https://generativelanguage.googleapis.com".to_string());

        let redis_url = env::var("REDIS_URL").ok();

        // Default 32-byte master tenant key
        let mut default_tenant_key = [0x53u8; 32];
        if let Ok(hex_key) = env::var("STATEGUARD_MASTER_KEY") {
            if let Ok(bytes) = hex::decode(hex_key) {
                if bytes.len() == 32 {
                    default_tenant_key.copy_from_slice(&bytes);
                }
            }
        }

        Self {
            host,
            port,
            mode,
            anthropic_upstream_url,
            openai_upstream_url,
            gemini_upstream_url,
            default_tenant_key,
            redis_url,
        }
    }
}
