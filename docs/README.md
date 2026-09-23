# HERA Architecture & Security Documentation

Welcome to the technical documentation for **Project Hera (StateGuard Core Engine v1.1.0)**.

---

## 📚 Table of Contents

1. [Threat Model & Attack Taxonomy](THREAT_MODEL.md) — Comprehensive analysis of Cryptographic Contextual Misbinding (arXiv:2608.09867), Decryption Oracles, and the Sanitization Trap.
2. [System Architecture & Invariants](ARCHITECTURE.md) — Mathematical specification of Invariants P1, P2, and P4, Associated Data (AD) tuples, and DAG sequence ratcheting.
3. [Gateway & Proxy Deployment](PROXY_DEPLOYMENT.md) — Production setup for the Rust reverse proxy in Docker, Kubernetes, and local environments.
4. [CLI Scanner & Secret Scrubber](CLI_SCANNER.md) — Manual for `stateguard` CLI, Shannon entropy detection, and Merkle proof verification.
5. [Client SDKs & Middleware](SDK_REFERENCE.md) — Integration guides for Python, TypeScript, LangChain, and Vercel AI SDK.

---

## 🌐 Live Platform & Demos

- **Live Production Console:** [https://herasec.vercel.app](https://herasec.vercel.app)
- **Security Advisory SG-ADV-2026-001:** [docs/launch/SECURITY_ADVISORY.md](launch/SECURITY_ADVISORY.md)
