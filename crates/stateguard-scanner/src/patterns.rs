use aho_corasick::{AhoCorasick, MatchKind};
use regex::Regex;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum SecretKind {
    AnthropicApiKey,
    OpenAiApiKey,
    GeminiApiKey,
    GitHubToken,
    AwsAccessKey,
    PrivateKeyHeader,
    DatabaseUrl,
    SocialSecurityNumber,
    CreditCardNumber,
    ReasoningEnvelope,
}

impl SecretKind {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::AnthropicApiKey => "ANTHROPIC_KEY",
            Self::OpenAiApiKey => "OPENAI_KEY",
            Self::GeminiApiKey => "GEMINI_KEY",
            Self::GitHubToken => "GITHUB_TOKEN",
            Self::AwsAccessKey => "AWS_ACCESS_KEY",
            Self::PrivateKeyHeader => "PRIVATE_KEY",
            Self::DatabaseUrl => "DATABASE_URL",
            Self::SocialSecurityNumber => "SSN",
            Self::CreditCardNumber => "CREDIT_CARD",
            Self::ReasoningEnvelope => "REASONING_ENVELOPE",
        }
    }
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct PatternMatch {
    pub kind: SecretKind,
    pub start: usize,
    pub end: usize,
    pub matched_text: String,
}

#[derive(Clone)]
pub struct PatternEngine {
    aho_corasick: AhoCorasick,
    fast_patterns: Vec<(&'static str, SecretKind)>,
    regexes: Vec<(Regex, SecretKind)>,
}

impl Default for PatternEngine {
    fn default() -> Self {
        Self::new()
    }
}

impl PatternEngine {
    pub fn new() -> Self {
        let fast_patterns = vec![
            ("-----BEGIN PRIVATE KEY-----", SecretKind::PrivateKeyHeader),
            ("-----BEGIN RSA PRIVATE KEY-----", SecretKind::PrivateKeyHeader),
            ("-----BEGIN EC PRIVATE KEY-----", SecretKind::PrivateKeyHeader),
            ("-----BEGIN OPENSSH PRIVATE KEY-----", SecretKind::PrivateKeyHeader),
            ("\"thought_signature\"", SecretKind::ReasoningEnvelope),
            ("\"encrypted_content\"", SecretKind::ReasoningEnvelope),
            ("\"signature\":", SecretKind::ReasoningEnvelope),
        ];

        let pattern_strings: Vec<&str> = fast_patterns.iter().map(|(p, _)| *p).collect();
        let ac = AhoCorasick::builder()
            .match_kind(MatchKind::Standard)
            .build(&pattern_strings)
            .expect("Valid Aho-Corasick patterns");

        let regexes = vec![
            (
                Regex::new(r"sk-ant-api[a-zA-Z0-9_\-]{20,}").unwrap(),
                SecretKind::AnthropicApiKey,
            ),
            (
                Regex::new(r"sk-(?:proj-|astra-)?[a-zA-Z0-9_\-]{20,}").unwrap(),
                SecretKind::OpenAiApiKey,
            ),
            (
                Regex::new(r"AIzaSy[a-zA-Z0-9_\-]{33}").unwrap(),
                SecretKind::GeminiApiKey,
            ),
            (
                Regex::new(r"ghp_[a-zA-Z0-9]{36}").unwrap(),
                SecretKind::GitHubToken,
            ),
            (
                Regex::new(r"\bAKIA[0-9A-Z]{16}\b").unwrap(),
                SecretKind::AwsAccessKey,
            ),
            (
                Regex::new(r#"(?:postgres(?:ql)?|mongodb(?:\+srv)?|mysql|redis)://[^\s"'<>]+"#).unwrap(),
                SecretKind::DatabaseUrl,
            ),
            (
                Regex::new(r"\b\d{3}-\d{2}-\d{4}\b").unwrap(),
                SecretKind::SocialSecurityNumber,
            ),
            (
                Regex::new(r"\b(?:\d{4}[ -]?){3}\d{4}\b").unwrap(),
                SecretKind::CreditCardNumber,
            ),
        ];

        Self {
            aho_corasick: ac,
            fast_patterns,
            regexes,
        }
    }

    pub fn scan(&self, text: &str) -> Vec<PatternMatch> {
        let mut matches = Vec::new();

        // 1. Fast literal scan via Aho-Corasick
        for mat in self.aho_corasick.find_iter(text) {
            let kind = self.fast_patterns[mat.pattern()].1;
            matches.push(PatternMatch {
                kind,
                start: mat.start(),
                end: mat.end(),
                matched_text: text[mat.start()..mat.end()].to_string(),
            });
        }

        // 2. Targeted regex patterns
        for (re, kind) in &self.regexes {
            for m in re.find_iter(text) {
                // If it's a credit card, validate with Luhn algorithm
                if *kind == SecretKind::CreditCardNumber && !luhn_check(m.as_str()) {
                    continue;
                }

                matches.push(PatternMatch {
                    kind: *kind,
                    start: m.start(),
                    end: m.end(),
                    matched_text: m.as_str().to_string(),
                });
            }
        }

        // Sort by start position
        matches.sort_by_key(|m| m.start);
        matches.dedup_by(|a, b| a.start == b.start && a.end == b.end);
        matches
    }
}

/// Luhn algorithm for validating credit card numbers
fn luhn_check(input: &str) -> bool {
    let digits: Vec<u32> = input
        .chars()
        .filter(|c| c.is_ascii_digit())
        .filter_map(|c| c.to_digit(10))
        .collect();

    if digits.len() < 13 || digits.len() > 19 {
        return false;
    }

    let mut sum = 0;
    let mut alternate = false;

    for &digit in digits.iter().rev() {
        if alternate {
            let d = digit * 2;
            sum += if d > 9 { d - 9 } else { d };
        } else {
            sum += digit;
        }
        alternate = !alternate;
    }

    sum % 10 == 0
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_pattern_detection() {
        let engine = PatternEngine::new();
        let input = r#"
            Here is my Anthropic key: sk-ant-api03-abcdef12345678901234567890_ABCD
            OpenAI Astra: sk-astra-abcdefghijklmnopqrstuvwxyz1234567890
            Gemini: AIzaSyD3abcdefghijklmnopqrstuvwxyz12345
            Database: postgres://user:password@db.example.com:5432/production
            Private: -----BEGIN PRIVATE KEY-----
            MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC3
        "#;

        let findings = engine.scan(input);
        let kinds: Vec<SecretKind> = findings.iter().map(|f| f.kind).collect();

        assert!(kinds.contains(&SecretKind::AnthropicApiKey));
        assert!(kinds.contains(&SecretKind::OpenAiApiKey));
        assert!(kinds.contains(&SecretKind::GeminiApiKey));
        assert!(kinds.contains(&SecretKind::DatabaseUrl));
        assert!(kinds.contains(&SecretKind::PrivateKeyHeader));
    }

    #[test]
    fn test_luhn_algorithm() {
        // Valid Visa test card
        assert!(luhn_check("4532-0150-1234-5678") || luhn_check("4000001234567899"));
        // Invalid card number
        assert!(!luhn_check("1234-5678-9012-3456"));
    }
}
