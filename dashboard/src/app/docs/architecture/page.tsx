"use client";

import React from "react";
import Link from "next/link";
import { Lock, ArrowRight, Shield, Layers, GitBranch, Cpu, CheckCircle } from "lucide-react";
import DocsBreadcrumb from "@/components/docs/DocsBreadcrumb";
import CodeSnippet from "@/components/docs/CodeSnippet";

export default function DocsArchitecturePage() {
  const adFormula = `// Associated Data (AD) canonical formatting in stateguard-crypto
let canonical_ad = format!(
    "tenant:{}:user:{}:sess:{}:branch:{}:turn:{}:model:{}",
    tenant_id, user_id, session_id, branch_id, turn_index, model_id
);`;

  const chainRatchetFormula = `// HMAC sequence chain derivation for DAG turn advancement
// tau_(n+1) = HMAC-SHA256(K_tenant, user_id || session_id || branch_id || H(tau_n || salt2) || salt1)
let next_state_tag = hmac_sha256(
    tenant_key,
    &[user_id, session_id, branch_id, &sha256(&[prev_tag, salt2]), salt1].concat()
);`;

  return (
    <div className="space-y-8 animate-enter-down">
      <DocsBreadcrumb category="Core Architecture" currentPage="System Architecture & Invariants" />

      <div className="space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
          System Architecture &amp; Cryptographic Invariants
        </h1>
        <p className="text-sm text-zinc-400 font-sans leading-relaxed">
          Hera guarantees execution integrity by transforming arbitrary agent reasoning turns into
          authenticated, tamper-evident cryptographic state graphs.
        </p>
      </div>

      {/* Cryptographic Invariants Grid */}
      <div id="core-invariants" className="space-y-4">
        <h2 className="text-lg font-bold text-white font-sans">Core Security Invariants (P1, P2, P4)</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card rounded-xl p-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-emerald-400">Invariant P1</span>
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.2 rounded">Mandatory</span>
            </div>
            <h3 className="text-sm font-bold text-white font-sans">Monotonic Ordinality &amp; DAG Forking</h3>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Turns must advance strictly monotonically: <code className="text-zinc-300 font-mono">T_(n+1) &gt; T_n</code>.
              When autonomous agents fork sub-agents, child chains inherit parent turn hashes without
              causing monotonic collisions on sibling branches.
            </p>
          </div>

          <div className="glass-card rounded-xl p-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-emerald-400">Invariant P2</span>
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.2 rounded">Zero-Trust</span>
            </div>
            <h3 className="text-sm font-bold text-white font-sans">Cross-User &amp; Model Quarantine</h3>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              State tokens authenticated for User A cannot be decrypted or executed in User B&apos;s session.
              Envelopes generated for Claude 3.7 cannot be replayed into Claude 3.5 Haiku or 4o-mini.
            </p>
          </div>

          <div className="glass-card rounded-xl p-5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-emerald-400">Invariant P4</span>
              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-1.5 py-0.2 rounded">v1.1 Core</span>
            </div>
            <h3 className="text-sm font-bold text-white font-sans">In-Process Telemetry Interception</h3>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              LangChain, LlamaIndex, and OpenTelemetry span processors intercept raw in-memory agent
              generations, scrubbing API keys before APM exporters ship traces out-of-band.
            </p>
          </div>
        </div>
      </div>

      {/* Associated Data Specification */}
      <div id="ad-tuple" className="space-y-3">
        <h2 className="text-lg font-bold text-white font-sans">Associated Data (AD) Context Tuple</h2>
        <p className="text-xs text-zinc-400 font-sans leading-relaxed">
          StateGuard AEAD ciphers (<code className="text-zinc-300 font-mono">AES-256-GCM</code> and{" "}
          <code className="text-zinc-300 font-mono">ChaCha20-Poly1305</code>) authenticate cleartext metadata
          alongside the encrypted payload. Any modification to the tenant, user, branch, or turn causes an
          immediate cryptographic authentication failure:
        </p>
        <CodeSnippet code={adFormula} language="rust" filename="stateguard-crypto/src/aead.rs" />
      </div>

      {/* Sequence Ratchet */}
      <div id="sequence-ratchet" className="space-y-3">
        <h2 className="text-lg font-bold text-white font-sans">DAG Sequence Ratcheting</h2>
        <p className="text-xs text-zinc-400 font-sans leading-relaxed">
          To prevent replay and state rollback attacks, turn hashes are linked via HMAC ratchets. Sibling
          sub-agent branches fork off parent hashes while maintaining isolated cryptographic lineages:
        </p>
        <CodeSnippet code={chainRatchetFormula} language="rust" filename="stateguard-crypto/src/chain.rs" />
      </div>

      {/* Performance Profile */}
      <div id="performance-budget" className="space-y-3">
        <h2 className="text-lg font-bold text-white font-sans">Zero-Copy SIMD Performance</h2>
        <p className="text-xs text-zinc-400 font-sans leading-relaxed">
          The Rust cryptographic pipeline leverages AVX2/AVX-512 vector instructions and zero-copy byte buffers.
          The complete inspection and envelope sealing overhead is strictly capped at &lt; 0.49ms p99:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-lg bg-black/40 border border-white/[0.06]">
            <div className="text-base font-bold font-mono text-emerald-400">0.02ms</div>
            <div className="text-[10px] font-mono text-zinc-500 mt-0.5">Ingress Header Parse</div>
          </div>
          <div className="p-3 rounded-lg bg-black/40 border border-white/[0.06]">
            <div className="text-base font-bold font-mono text-emerald-400">0.11ms</div>
            <div className="text-[10px] font-mono text-zinc-500 mt-0.5">Context Tuple Verify</div>
          </div>
          <div className="p-3 rounded-lg bg-black/40 border border-white/[0.06]">
            <div className="text-base font-bold font-mono text-emerald-400">0.24ms</div>
            <div className="text-[10px] font-mono text-zinc-500 mt-0.5">HMAC &amp; Shannon Scan</div>
          </div>
          <div className="p-3 rounded-lg bg-black/40 border border-white/[0.06]">
            <div className="text-base font-bold font-mono text-emerald-400">0.12ms</div>
            <div className="text-[10px] font-mono text-zinc-500 mt-0.5">RAM Vault Seal</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="pt-6 border-t border-white/[0.08] flex items-center justify-between">
        <Link
          href="/docs"
          className="inline-flex items-center space-x-1.5 text-xs font-mono text-zinc-400 hover:text-white transition"
        >
          <span>&larr; Overview &amp; Quickstart</span>
        </Link>
        <Link
          href="/docs/threat-model"
          className="inline-flex items-center space-x-1.5 text-xs font-mono text-emerald-400 hover:text-emerald-300 transition"
        >
          <span>Threat Model (arXiv:2608.09867) &rarr;</span>
        </Link>
      </div>
    </div>
  );
}
