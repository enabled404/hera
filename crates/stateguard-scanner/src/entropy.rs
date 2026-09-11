use std::collections::HashMap;

/// Calculates Shannon entropy of a byte slice:
/// H(X) = -sum(P(x_i) * log2(P(x_i)))
pub fn shannon_entropy(data: &[u8]) -> f64 {
    if data.is_empty() {
        return 0.0;
    }

    let mut frequencies = HashMap::new();
    for &byte in data {
        *frequencies.entry(byte).or_insert(0usize) += 1;
    }

    let len = data.len() as f64;
    let mut entropy = 0.0;

    for &count in frequencies.values() {
        let p = (count as f64) / len;
        entropy -= p * p.log2();
    }

    entropy
}

/// Sliding window entropy scanner to find high-entropy segments (such as raw secrets or base64 blobs)
#[derive(Debug, Clone)]
pub struct SlidingEntropyScanner {
    pub window_size: usize,
    pub step: usize,
    pub threshold: f64,
    pub min_len: usize,
}

impl Default for SlidingEntropyScanner {
    fn default() -> Self {
        Self {
            window_size: 32,
            step: 8,
            threshold: 4.2, // Base64 typically exhibits ~4.5-5.5 bits of entropy
            min_len: 20,
        }
    }
}

#[derive(Debug, Clone, PartialEq)]
pub struct HighEntropyFinding {
    pub start: usize,
    pub end: usize,
    pub entropy: f64,
    pub snippet: String,
}

impl SlidingEntropyScanner {
    pub fn new(window_size: usize, threshold: f64) -> Self {
        Self {
            window_size,
            step: window_size / 4,
            threshold,
            min_len: 20,
        }
    }

    pub fn scan(&self, text: &str) -> Vec<HighEntropyFinding> {
        let bytes = text.as_bytes();
        if bytes.len() < self.min_len {
            return Vec::new();
        }

        let mut findings = Vec::new();
        let win = self.window_size.min(bytes.len());

        let mut i = 0;
        while i + win <= bytes.len() {
            let slice = &bytes[i..i + win];
            let entropy = shannon_entropy(slice);

            if entropy >= self.threshold {
                let snippet = String::from_utf8_lossy(slice).to_string();
                findings.push(HighEntropyFinding {
                    start: i,
                    end: i + win,
                    entropy,
                    snippet,
                });
                // Skip ahead to avoid excessive overlapping reports
                i += win;
            } else {
                i += self.step.max(1);
            }
        }

        findings
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_shannon_entropy_uniform_vs_random() {
        let low_entropy = b"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
        assert_eq!(shannon_entropy(low_entropy), 0.0);

        let natural_text = b"The quick brown fox jumps over the lazy dog";
        let text_entropy = shannon_entropy(natural_text);
        assert!(text_entropy > 3.0 && text_entropy < 4.5);

        // High entropy (random base64 or crypto key)
        let high_entropy = b"V1p5RHRQek13TUFRa2lqWjdrR3hZbFNYVFlrWWJjV3I=";
        let crypto_entropy = shannon_entropy(high_entropy);
        assert!(crypto_entropy > 4.2);
    }
}
