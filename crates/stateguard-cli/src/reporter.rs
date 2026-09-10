use crate::scanner::AuditIssue;
use comfy_table::{Attribute, Cell, Color, ContentArrangement, Table};
use serde_json::json;
use std::fs;
use std::path::Path;

pub struct Reporter;

impl Reporter {
    pub fn print_terminal_table(issues: &[AuditIssue]) {
        if issues.is_empty() {
            println!("\n✅ StateGuard Audit: No trace integrity violations or exposed secrets found.\n");
            return;
        }

        println!("\n🚨 StateGuard Security Audit Findings (Total: {}):\n", issues.len());

        let mut table = Table::new();
        table.set_content_arrangement(ContentArrangement::Dynamic);
        table.set_header(vec![
            Cell::new("Rule").add_attribute(Attribute::Bold),
            Cell::new("Severity").add_attribute(Attribute::Bold),
            Cell::new("Location").add_attribute(Attribute::Bold),
            Cell::new("Issue").add_attribute(Attribute::Bold),
            Cell::new("Snippet").add_attribute(Attribute::Bold),
        ]);

        for issue in issues {
            let sev_color = match issue.severity.as_str() {
                "CRITICAL" => Color::Red,
                "HIGH" => Color::DarkYellow,
                "MEDIUM" => Color::Yellow,
                _ => Color::Cyan,
            };

            table.add_row(vec![
                Cell::new(&issue.rule_id).fg(Color::Cyan),
                Cell::new(&issue.severity).fg(sev_color),
                Cell::new(format!("{}:{}", issue.file_path, issue.line_number)),
                Cell::new(&issue.message),
                Cell::new(&issue.snippet),
            ]);
        }

        println!("{table}\n");
    }

    pub fn write_json_report(issues: &[AuditIssue], path: &Path) -> Result<(), std::io::Error> {
        let json_data = json!({
            "scanner": "stateguard-cli",
            "version": env!("CARGO_PKG_VERSION"),
            "total_findings": issues.len(),
            "findings": issues
        });
        fs::write(path, serde_json::to_string_pretty(&json_data)?)
    }

    pub fn write_sarif_report(issues: &[AuditIssue], path: &Path) -> Result<(), std::io::Error> {
        let sarif = json!({
            "$schema": "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
            "version": "2.1.0",
            "runs": [
                {
                    "tool": {
                        "driver": {
                            "name": "StateGuard Static Trace Scanner",
                            "version": env!("CARGO_PKG_VERSION"),
                            "informationUri": "https://github.com/stateguard/stateguard",
                            "rules": [
                                {
                                    "id": "SG-001",
                                    "shortDescription": { "text": "Raw reasoning envelope exposed" },
                                    "defaultConfiguration": { "level": "error" }
                                },
                                {
                                    "id": "SG-002",
                                    "shortDescription": { "text": "Sensitive credential leak in trace" },
                                    "defaultConfiguration": { "level": "error" }
                                },
                                {
                                    "id": "SG-003",
                                    "shortDescription": { "text": "Invisible injection prompt detected" },
                                    "defaultConfiguration": { "level": "warning" }
                                },
                                {
                                    "id": "SG-004",
                                    "shortDescription": { "text": "Unsanitized high-entropy token" },
                                    "defaultConfiguration": { "level": "note" }
                                }
                            ]
                        }
                    },
                    "results": issues.iter().map(|issue| {
                        let level = match issue.severity.as_str() {
                            "CRITICAL" => "error",
                            "HIGH" => "warning",
                            _ => "note",
                        };

                        json!({
                            "ruleId": issue.rule_id,
                            "level": level,
                            "message": { "text": issue.message },
                            "locations": [
                                {
                                    "physicalLocation": {
                                        "artifactLocation": {
                                            "uri": issue.file_path
                                        },
                                        "region": {
                                            "startLine": issue.line_number
                                        }
                                    }
                                }
                            ]
                        })
                    }).collect::<Vec<_>>()
                }
            ]
        });

        fs::write(path, serde_json::to_string_pretty(&sarif)?)
    }
}
