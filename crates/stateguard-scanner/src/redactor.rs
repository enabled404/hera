use crate::entropy::SlidingEntropyScanner;
use crate::patterns::PatternEngine;
use serde_json::Value;
use sha2::{Digest, Sha256};

#[derive(Clone)]
pub struct Redactor {
    pub pattern_engine: PatternEngine,
    pub entropy_scanner: SlidingEntropyScanner,
}

impl Default for Redactor {
    fn default() -> Self {
        Self::new()
    }
}

impl Redactor {
    pub fn new() -> Self {
        Self {
            pattern_engine: PatternEngine::new(),
            entropy_scanner: SlidingEntropyScanner::default(),
        }
    }

    pub fn entropy_scanner(&self) -> &SlidingEntropyScanner {
        &self.entropy_scanner
    }

    /// Redacts a single string, replacing detected secrets with [REDACTED:<KIND>:<HASH>]
    pub fn redact_text(&self, text: &str) -> (String, usize) {
        let mut matches = self.pattern_engine.scan(text);
        if matches.is_empty() {
            return (text.to_string(), 0);
        }

        // Sort descending by start index to substitute from right to left
        matches.sort_by(|a, b| b.start.cmp(&a.start));

        let mut redacted = text.to_string();
        let match_count = matches.len();

        for m in matches {
            let hash_str = compute_fingerprint(&m.matched_text);
            let mask = format!("[REDACTED:{}:{}]", m.kind.as_str(), &hash_str[0..8]);
            redacted.replace_range(m.start..m.end, &mask);
        }

        (redacted, match_count)
    }

    /// Recursively scrubs all string fields in arbitrary JSON telemetry trees
    pub fn scrub_json(&self, val: &mut Value) -> usize {
        let mut total_redactions = 0;
        match val {
            Value::String(s) => {
                let (cleaned, count) = self.redact_text(s);
                if count > 0 {
                    *s = cleaned;
                    total_redactions += count;
                }
            }
            Value::Array(arr) => {
                for item in arr {
                    total_redactions += self.scrub_json(item);
                }
            }
            Value::Object(map) => {
                // If key is a sensitive key or contains reasoning envelopes
                let keys_to_scrub: Vec<String> = map.keys().cloned().collect();
                for k in keys_to_scrub {
                    if let Some(v) = map.get_mut(&k) {
                        total_redactions += self.scrub_json(v);
                    }
                }
            }
            _ => {}
        }
        total_redactions
    }
}

pub fn compute_fingerprint(data: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(data.as_bytes());
    hex::encode(hasher.finalize())
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_redact_text() {
        let redactor = Redactor::new();
        let input = "Remove this key: sk-ant-api03-12345678901234567890abcdef and DB postgres://admin:secret@db.lan:5432/app";
        let (output, count) = redactor.redact_text(input);

        assert!(count >= 2);
        assert!(!output.contains("sk-ant-api03"));
        assert!(!output.contains("postgres://admin:secret"));
        assert!(output.contains("[REDACTED:"));
    }

    #[test]
    fn test_scrub_json_telemetry() {
        let redactor = Redactor::new();
        let mut trace = json!({
            "trace_id": "tr-9812",
            "spans": [
                {
                    "name": "agent_execution",
                    "attributes": {
                        "prompt": "Here is AWS key AKIAIOSFODNN7EXAMPLE to use",
                        "raw_cot": "Thinking about removing AKIAIOSFODNN7EXAMPLE from config file"
                    }
                }
            ]
        });

        let scrubbed_count = redactor.scrub_json(&mut trace);
        assert!(scrubbed_count >= 2);

        let output_str = trace.to_string();
        assert!(!output_str.contains("AKIAIOSFODNN7EXAMPLE"));
        assert!(output_str.contains("[REDACTED:AWS_ACCESS_KEY:"));
    }
}
