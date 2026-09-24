# HERA: CLI Scanner & Secret Scrubber Reference

The `stateguard` command-line utility provides zero-copy streaming secret scanning, repository audits, and offline Merkle proof verification.

---

## 1. Installation

Pre-built binaries are available for macOS and Linux on [GitHub Releases](https://github.com/enabled404/hera/releases):

```bash
# macOS (Apple Silicon ARM64)
curl -L https://github.com/enabled404/hera/releases/download/v1.1.0/stateguard-aarch64-apple-darwin.tar.gz | tar -xz
sudo mv stateguard /usr/local/bin/

# Linux (x86_64)
curl -L https://github.com/enabled404/hera/releases/download/v1.1.0/stateguard-x86_64-unknown-linux-gnu.tar.gz | tar -xz
sudo mv stateguard /usr/local/bin/
```

Or install via Cargo:
```bash
cargo install --path crates/stateguard-cli
```

---

## 2. Scanning Trajectories & Logs

Scan autonomous agent transcripts, JSONL logs, or codebases for secrets trapped in reasoning traces:

```bash
# Scan a directory of agent traces
stateguard scan ./agent_trajectories/ --entropy-threshold 4.2

# Output structured JSON report for CI/CD pipelines
stateguard scan ./logs/ --format json --output audit_report.json
```

---

## 3. Streaming Shannon Entropy Detection ($H(X) \ge 4.2$)

StateGuard evaluates the information entropy of character distributions across streaming tokens using sliding windows:

$$H(X) = -\sum_{i=1}^{n} P(x_i) \log_2 P(x_i)$$

- Standard natural language text typically exhibits $H(X) \approx 2.5 - 3.5\text{ bits}$.
- High-entropy cryptographic secrets (AWS Access Keys, Private Keys, Stripe Keys, JWTs) typically exhibit $H(X) \ge 4.2\text{ bits}$.
- Matches are cross-validated against built-in tokenizers and Luhn check algorithms before redaction.

---

## 4. Key Management & Vault Inspection

```bash
# Generate a cryptographically secure 256-bit master key
stateguard keys generate

# Inspect active vaulted sessions in local Redis
stateguard vault inspect --redis-url redis://127.0.0.1:6379 --session sess-code-audit-88

# Verify a Merkle proof of state integrity
stateguard verify-proof --proof-file proof.json --root-hash 0a8b9c...
```
