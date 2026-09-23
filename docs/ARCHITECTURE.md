# HERA: System Architecture & Cryptographic Invariants

StateGuard Core Engine guarantees autonomous agent execution integrity by transforming arbitrary reasoning turns into authenticated, tamper-evident cryptographic state graphs.

---

## 1. Core Security Invariants (P1, P2, P4)

| Invariant | Classification | Enforcement Mechanism |
| :--- | :--- | :--- |
| **Invariant P1** | **Monotonic Ordinality & DAG Forking** | Turns must advance strictly monotonically: $T_{n+1} > T_n$. When autonomous agents fork sub-agents, child chains inherit parent turn hashes without causing monotonic collisions on sibling branches. |
| **Invariant P2** | **Zero-Trust Cross-User & Model Lineage Quarantine** | State tokens authenticated for User A cannot be decrypted or executed in User B's session. Reasoning envelopes generated for Claude Opus 5.5 / Sonnet 3.7 cannot be replayed into weaker models (Claude Haiku or 4o-mini). |
| **Invariant P4** | **In-Flight & In-Process Telemetry Interception** | Zero-copy streaming Shannon entropy evaluation ($H(X) \ge 4.2$) intercepts raw reasoning generations, redacting API keys and secrets before APM exporters ship traces out-of-band. |

---

## 2. Associated Data (AD) Context Tuple

StateGuard AEAD ciphers (`AES-256-GCM` and `ChaCha20-Poly1305`) authenticate cleartext metadata alongside the encrypted reasoning payload. Any modification to the tenant, user, branch, turn, or model causes an immediate authentication failure at proxy ingress:

```rust
// Associated Data (AD) canonical formatting in stateguard-crypto
let canonical_ad = format!(
    "tenant:{}:user:{}:sess:{}:branch:{}:turn:{}:model:{}",
    tenant_id, user_id, session_id, branch_id, turn_index, model_id
);
```

### Context Tuple Components:
1. `tenant_id`: Cryptographic boundary for multi-tenant isolation.
2. `user_id`: Zero-trust user entity bound to the active authentication session.
3. `session_id`: Unique conversation or agent trajectory identifier.
4. `branch_id`: DAG sub-agent branch identifier (`main`, `branch-01`, etc.).
5. `turn_index`: Monotonically incrementing turn counter preventing replay attacks.
6. `model_id`: Frontier model lineage identifier preventing down-tier decryption oracles.

---

## 3. DAG Sequence Ratcheting & Forking

To prevent state rollback attacks and desynchronization in multi-agent workflows, turn hashes are linked via HMAC ratchets. Sibling sub-agent branches fork off parent hashes while maintaining isolated cryptographic lineages:

```rust
// HMAC sequence chain derivation for DAG turn advancement
// tau_(n+1) = HMAC-SHA256(K_tenant, user_id || session_id || branch_id || H(tau_n || salt2) || salt1)
let next_state_tag = hmac_sha256(
    tenant_key,
    &[user_id, session_id, branch_id, &sha256(&[prev_tag, salt2]), salt1].concat()
);
```

---

## 4. Ephemeral Vaulting (`sgh_` Handles)

In **Stateful Vault Mode**, raw reasoning envelopes are stripped from the response before returning to clients. They are stored in RAM / Redis with a configured TTL (default: 3600 seconds) and replaced with an unforgeable, authenticated handle:

```
Provider (Claude/OpenAI) 
   ──> Encrypted Envelope (`eyJ...`) 
   ──> StateGuard Ingress
         ├── Verify Associated Data (P1, P2)
         ├── Shannon Entropy Scan (P4)
         └── Store in Ephemeral RAM Vault
   ──> Client receives: `sgh_0191e4a2-8b3c-7890-a1b2-c3d4e5f6a7b8`
```

---

## 5. Merkle Tree State Auditing & Compaction

StateGuard continuously maintains an incremental Merkle tree of state transitions. For long-running autonomous workflows exceeding 100 turns, older turns are compacted into cryptographic root proofs, allowing infinite-horizon agents to verify historical state integrity with zero latency overhead.
