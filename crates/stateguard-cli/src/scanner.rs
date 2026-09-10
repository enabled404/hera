use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use stateguard_scanner::{PatternEngine, SecretKind, SlidingEntropyScanner};
use std::fs;
use std::path::{Path, PathBuf};
use walkdir::WalkDir;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuditIssue {
    pub file_path: String,
    pub line_number: usize,
    pub issue_type: String, // 'RAW_REASONING_ENVELOPE', 'SECRET_LEAK', 'HIGH_ENTROPY_TOKEN', 'INVISIBLE_INJECTION'
    pub severity: String,   // 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'
    pub message: String,
    pub snippet: String,
    pub rule_id: String,
}

pub struct TraceAuditor {
    pattern_engine: PatternEngine,
    entropy_scanner: SlidingEntropyScanner,
}

impl Default for TraceAuditor {
    fn default() -> Self {
        Self {
            pattern_engine: PatternEngine::new(),
            entropy_scanner: SlidingEntropyScanner::default(),
        }
    }
}

impl TraceAuditor {
    pub fn new(entropy_threshold: f64) -> Self {
        Self {
            pattern_engine: PatternEngine::new(),
            entropy_scanner: SlidingEntropyScanner::new(32, entropy_threshold),
        }
    }

    pub fn audit_directory(&self, target_dir: &Path) -> Vec<AuditIssue> {
        let valid_extensions = ["json", "jsonl", "log", "har", "trace", "csv"];

        let files: Vec<PathBuf> = WalkDir::new(target_dir)
            .into_iter()
            .filter_map(|e| e.ok())
            .filter(|e| e.file_type().is_file())
            .filter(|e| {
                if let Some(ext) = e.path().extension().and_then(|s| s.to_str()) {
                    valid_extensions.contains(&ext.to_lowercase().as_str())
                } else {
                    false
                }
            })
            .map(|e| e.into_path())
            .collect();

        files
            .par_iter()
            .flat_map(|file| self.audit_file(file))
            .collect()
    }

    pub fn audit_file(&self, path: &Path) -> Vec<AuditIssue> {
        let mut issues = Vec::new();
        let content = match fs::read_to_string(path) {
            Ok(c) => c,
            Err(_) => return issues,
        };

        let file_str = path.display().to_string();

        for (line_idx, line) in content.lines().enumerate() {
            let line_num = line_idx + 1;

            // 1. Scan for raw unredacted reasoning envelopes
            if (line.contains("\"signature\":") || line.contains("\"thought_signature\":") || line.contains("\"encrypted_content\":"))
                && !line.contains("sgh_")
                && !line.contains("[REDACTED:")
            {
                issues.push(AuditIssue {
                    file_path: file_str.clone(),
                    line_number: line_num,
                    issue_type: "RAW_REASONING_ENVELOPE".to_string(),
                    severity: "CRITICAL".to_string(),
                    message: "Raw unredacted reasoning envelope exposed in trace log".to_string(),
                    snippet: truncate_str(line, 100),
                    rule_id: "SG-001".to_string(),
                });
            }

            // 2. Scan for leaked secrets & API keys
            let secret_matches = self.pattern_engine.scan(line);
            for m in secret_matches {
                if m.kind != SecretKind::ReasoningEnvelope {
                    issues.push(AuditIssue {
                        file_path: file_str.clone(),
                        line_number: line_num,
                        issue_type: "SECRET_LEAK".to_string(),
                        severity: "CRITICAL".to_string(),
                        message: format!("Sensitive credential ({}) detected in trace data", m.kind.as_str()),
                        snippet: truncate_str(line, 100),
                        rule_id: "SG-002".to_string(),
                    });
                }
            }

            // 3. Scan for invisible injection indicators
            if line.to_lowercase().contains("<thinking-copy>")
                || line.contains("system-override")
                || line.contains("IGNORE PREVIOUS INSTRUCTIONS")
            {
                issues.push(AuditIssue {
                    file_path: file_str.clone(),
                    line_number: line_num,
                    issue_type: "INVISIBLE_INJECTION".to_string(),
                    severity: "HIGH".to_string(),
                    message: "Suspicious injection prompt or system override directive in trajectory".to_string(),
                    snippet: truncate_str(line, 100),
                    rule_id: "SG-003".to_string(),
                });
            }

            // 4. Sliding entropy scan
            let entropy_findings = self.entropy_scanner.scan(line);
            for f in entropy_findings {
                // Avoid duplicating if line already has a known secret
                if !line.contains("sk-") && !line.contains("AKIA") {
                    issues.push(AuditIssue {
                        file_path: file_str.clone(),
                        line_number: line_num,
                        issue_type: "HIGH_ENTROPY_TOKEN".to_string(),
                        severity: "MEDIUM".to_string(),
                        message: format!(
                            "Unidentified high-entropy token (entropy: {:.2} bits)",
                            f.entropy
                        ),
                        snippet: truncate_str(&f.snippet, 60),
                        rule_id: "SG-004".to_string(),
                    });
                }
            }
        }

        issues
    }
}

fn truncate_str(s: &str, max_len: usize) -> String {
    let trimmed = s.trim();
    if trimmed.len() <= max_len {
        trimmed.to_string()
    } else {
        format!("{}...", &trimmed[..max_len])
    }
}
