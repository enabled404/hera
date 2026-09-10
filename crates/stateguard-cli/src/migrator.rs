use chrono::Utc;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use stateguard_scanner::Redactor;
use stateguard_vault::generate_token_handle;
use std::fs;
use std::path::Path;
use walkdir::WalkDir;

#[derive(Debug, Serialize, Deserialize)]
pub struct MigrationReport {
    pub timestamp: String,
    pub input_directory: String,
    pub output_directory: String,
    pub files_processed: usize,
    pub signatures_vaulted: usize,
    pub secrets_scrubbed: usize,
    pub status: String,
}

pub struct Migrator {
    gateway_url: Option<String>,
    tenant_key: Option<String>,
    redactor: Redactor,
}

impl Migrator {
    pub fn new(gateway_url: Option<String>, tenant_key: Option<String>) -> Self {
        Self {
            gateway_url,
            tenant_key,
            redactor: Redactor::new(),
        }
    }

    pub fn migrate_directory(
        &self,
        input_dir: &Path,
        output_dir: &Path,
    ) -> Result<MigrationReport, Box<dyn std::error::Error>> {
        fs::create_dir_all(output_dir)?;

        let mut files_processed = 0;
        let mut signatures_vaulted = 0;
        let mut secrets_scrubbed = 0;

        for entry in WalkDir::new(input_dir).into_iter().filter_map(|e| e.ok()) {
            let path = entry.path();
            if !path.is_file() {
                continue;
            }

            let rel_path = path.strip_prefix(input_dir)?;
            let dest_path = output_dir.join(rel_path);

            if let Some(parent) = dest_path.parent() {
                fs::create_dir_all(parent)?;
            }

            let content = fs::read_to_string(path)?;

            let (sanitized_content, sigs_count, secrets_count) = self.process_file_content(&content);

            fs::write(&dest_path, sanitized_content)?;

            files_processed += 1;
            signatures_vaulted += sigs_count;
            secrets_scrubbed += secrets_count;
        }

        let report = MigrationReport {
            timestamp: Utc::now().to_rfc3339(),
            input_directory: input_dir.to_string_lossy().to_string(),
            output_directory: output_dir.to_string_lossy().to_string(),
            files_processed,
            signatures_vaulted,
            secrets_scrubbed,
            status: "COMPLETED".to_string(),
        };

        let report_path = output_dir.join("migration_report.json");
        fs::write(&report_path, serde_json::to_string_pretty(&report)?)?;

        Ok(report)
    }

    fn process_file_content(&self, content: &str) -> (String, usize, usize) {
        // Attempt JSON parse
        if let Ok(mut json_val) = serde_json::from_str::<Value>(content) {
            let mut sigs = 0;
            let mut secrets = 0;

            // Try gateway if configured
            if let Some(ref gw) = self.gateway_url {
                if let Ok(sanitized) = self.call_gateway_resign(gw, &json_val) {
                    let out_str = serde_json::to_string_pretty(&sanitized.0).unwrap_or_else(|_| content.to_string());
                    return (out_str, sanitized.1, sanitized.2);
                }
            }

            // Local fallback / standalone migration
            secrets += self.redactor.scrub_json(&mut json_val);
            self.re_sign_json_value(&mut json_val, &mut sigs);

            let out_str = serde_json::to_string_pretty(&json_val).unwrap_or_else(|_| content.to_string());
            (out_str, sigs, secrets)
        } else {
            // Text or line-based format (e.g. jsonl)
            let mut sigs = 0;
            let (mut scrubbed, secrets) = self.redactor.redact_text(content);

            // Replace raw signature occurrences in text
            scrubbed = self.replace_text_signatures(&scrubbed, &mut sigs);
            (scrubbed, sigs, secrets)
        }
    }

    fn call_gateway_resign(
        &self,
        gateway_url: &str,
        val: &Value,
    ) -> Result<(Value, usize, usize), Box<dyn std::error::Error>> {
        let endpoint = format!("{}/api/v1/traces/re-sign", gateway_url.trim_end_matches('/'));
        let client = reqwest::blocking::Client::builder()
            .timeout(std::time::Duration::from_secs(10))
            .build()?;

        let mut req = client.post(&endpoint).json(val);
        if let Some(ref key) = self.tenant_key {
            req = req.header("x-stateguard-tenant-key", key);
        }

        let resp = req.send()?;
        if resp.status().is_success() {
            let res_json: Value = resp.json()?;
            let sanitized = res_json.get("sanitized_traces").cloned().unwrap_or_else(|| val.clone());
            let sigs = res_json
                .get("stats")
                .and_then(|s| s.get("signatures_vaulted"))
                .and_then(|v| v.as_u64())
                .unwrap_or(0) as usize;
            let secrets = res_json
                .get("stats")
                .and_then(|s| s.get("credentials_scrubbed"))
                .and_then(|v| v.as_u64())
                .unwrap_or(0) as usize;
            Ok((sanitized, sigs, secrets))
        } else {
            Err(format!("Gateway returned status {}", resp.status()).into())
        }
    }

    fn re_sign_json_value(&self, val: &mut Value, sig_count: &mut usize) {
        match val {
            Value::Object(map) => {
                if let Some(sig) = map.get_mut("signature") {
                    if let Some(s) = sig.as_str() {
                        if !s.starts_with("sgh_") && !s.starts_with("sg_env_") {
                            let handle = generate_token_handle();
                            *sig = Value::String(handle);
                            *sig_count += 1;
                        }
                    }
                }
                if let Some(enc) = map.get_mut("encrypted_content") {
                    if let Some(s) = enc.as_str() {
                        if !s.starts_with("sgh_") && !s.starts_with("sg_env_") {
                            let handle = generate_token_handle();
                            *enc = Value::String(handle);
                            *sig_count += 1;
                        }
                    }
                }
                if let Some(tsig) = map.get_mut("thought_signature") {
                    if let Some(s) = tsig.as_str() {
                        if !s.starts_with("sgh_") && !s.starts_with("sg_env_") {
                            let handle = generate_token_handle();
                            *tsig = Value::String(handle);
                            *sig_count += 1;
                        }
                    }
                }
                for (_, v) in map.iter_mut() {
                    self.re_sign_json_value(v, sig_count);
                }
            }
            Value::Array(arr) => {
                for v in arr.iter_mut() {
                    self.re_sign_json_value(v, sig_count);
                }
            }
            _ => {}
        }
    }

    fn replace_text_signatures(&self, text: &str, sig_count: &mut usize) -> String {
        let mut result = text.to_string();
        for field in &["signature", "encrypted_content", "thought_signature"] {
            let re_str = format!(r#""{}"\s*:\s*"([^"]+)""#, field);
            if let Ok(re) = regex::Regex::new(&re_str) {
                result = re
                    .replace_all(&result, |caps: &regex::Captures| {
                        let val = &caps[1];
                        if !val.starts_with("sgh_") && !val.starts_with("sg_env_") {
                            *sig_count += 1;
                            let handle = generate_token_handle();
                            format!(r#""{}": "{}""#, field, handle)
                        } else {
                            caps[0].to_string()
                        }
                    })
                    .to_string();
            }
        }
        result
    }
}
