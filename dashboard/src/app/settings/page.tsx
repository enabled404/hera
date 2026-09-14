"use client";

import React, { useState } from "react";
import {
  Sliders,
  Shield,
  Key,
  Lock,
  Cpu,
  RefreshCw,
  Check,
  AlertCircle,
  Zap,
  Server,
  Fingerprint,
} from "lucide-react";

export default function SettingsPolicyPage() {
  const [mode, setMode] = useState<"STATEFUL_VAULT" | "STATELESS_BINDING">("STATEFUL_VAULT");
  const [cipherSuite, setCipherSuite] = useState<string>("AES_256_GCM");
  const [vaultTtl, setVaultTtl] = useState<number>(3600);
  const [entropyThreshold, setEntropyThreshold] = useState<number>(4.2);
  const [enforceDagLineage, setEnforceDagLineage] = useState<boolean>(true);
  const [interceptTelemetry, setInterceptTelemetry] = useState<boolean>(true);
  const [quarantineCrossUser, setQuarantineCrossUser] = useState<boolean>(true);
  const [keyRotated, setKeyRotated] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleRotateKey = () => {
    setKeyRotated(true);
    setTimeout(() => setKeyRotated(false), 2500);
  };

  return (
    <div className="max-w-5xl space-y-8 animate-enter-down">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Gateway Security Policy
            </span>
            <span className="text-xs text-zinc-500 font-mono">· Zero-Trust Config</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans mt-1">
            Security Envelopes &amp; Invariant Policy
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5 max-w-2xl font-sans">
            Configure architectural state handling, AEAD cryptographic cipher suites, tenant master keys, and streaming entropy thresholds.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleRotateKey}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.08] text-xs font-mono text-zinc-300 hover:text-white transition"
          >
            <RefreshCw className={`h-3 w-3 text-zinc-400 ${keyRotated ? "animate-spin text-emerald-400" : ""}`} />
            <span>{keyRotated ? "Key Rotated!" : "Rotate Tenant Master Key"}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Architecture Mode Card */}
        <div className="glass-panel rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center space-x-2">
              <Cpu className="h-4 w-4 text-zinc-400" />
              <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-200">
                1. State Security Architecture Mode
              </h2>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded">
              Active: {mode}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mode 1: Stateful Vault */}
            <div
              onClick={() => setMode("STATEFUL_VAULT")}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                mode === "STATEFUL_VAULT"
                  ? "bg-zinc-900/90 border-emerald-500/40 shadow-sm"
                  : "bg-[#0c0c0e]/60 border-white/[0.06] hover:border-white/[0.12] hover:bg-zinc-900/40 text-zinc-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm font-sans text-white flex items-center space-x-2">
                  <span>Stateful Ephemeral Vault</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded">
                  Recommended
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-2 font-sans leading-relaxed">
                Strips provider reasoning envelopes entirely. Clients receive opaque UUIDv7 / CSPRNG(256-bit) handles stored in memory with strict TTLs.
              </p>
              <div className="mt-3 text-[10px] font-mono text-emerald-400 flex items-center space-x-1">
                <Check className="h-3 w-3" />
                <span>Zero model reasoning leakage to edge or client</span>
              </div>
            </div>

            {/* Mode 2: Stateless Binding */}
            <div
              onClick={() => setMode("STATELESS_BINDING")}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                mode === "STATELESS_BINDING"
                  ? "bg-zinc-900/90 border-emerald-500/40 shadow-sm"
                  : "bg-[#0c0c0e]/60 border-white/[0.06] hover:border-white/[0.12] hover:bg-zinc-900/40 text-zinc-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm font-sans text-white">
                  Stateless Contextual Binding
                </span>
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800/60 border border-white/[0.08] px-2 py-0.5 rounded">
                  Autonomous
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-2 font-sans leading-relaxed">
                Wraps tokens in an authenticated outer AEAD envelope bound to (tenant, user, session, turn, model) and HMAC sequence chains.
              </p>
              <div className="mt-3 text-[10px] font-mono text-zinc-400 flex items-center space-x-1">
                <Shield className="h-3 w-3 text-zinc-400" />
                <span>Cryptographically unforgeable across sessions</span>
              </div>
            </div>
          </div>

          {/* Mode Specific Config */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {mode === "STATEFUL_VAULT" ? (
              <div className="space-y-1">
                <label className="text-xs font-mono text-zinc-300">
                  Ephemeral Vault In-Memory TTL
                </label>
                <div className="text-[11px] text-zinc-500">
                  State handles automatically expire and are purged after inactivity.
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-xs font-mono text-zinc-300">
                  AEAD Authenticated Cipher Suite
                </label>
                <div className="text-[11px] text-zinc-500">
                  Hardware-accelerated authenticated envelope encryption.
                </div>
              </div>
            )}

            {mode === "STATEFUL_VAULT" ? (
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={vaultTtl}
                  onChange={(e) => setVaultTtl(Number(e.target.value))}
                  className="bg-black/60 border border-white/[0.1] rounded-lg px-3 py-1.5 text-xs font-mono text-white w-32 focus:outline-none focus:border-zinc-500"
                />
                <span className="text-xs font-mono text-zinc-400">seconds (1h)</span>
              </div>
            ) : (
              <select
                value={cipherSuite}
                onChange={(e) => setCipherSuite(e.target.value)}
                className="bg-black/60 border border-white/[0.1] rounded-lg px-3 py-1.5 text-xs font-mono text-white w-56 focus:outline-none focus:border-zinc-500"
              >
                <option value="AES_256_GCM">AES-256-GCM (Hardware AES-NI)</option>
                <option value="CHACHA20_POLY1305">ChaCha20-Poly1305 (ARM NEON)</option>
              </select>
            )}
          </div>
        </div>

        {/* Section 2: Cryptographic Invariant Enforcement */}
        <div className="glass-panel rounded-xl p-6 space-y-5">
          <div className="flex items-center space-x-2 border-b border-white/[0.06] pb-3">
            <Shield className="h-4 w-4 text-emerald-400" />
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-200">
              2. Core Cryptographic Invariants
            </h2>
          </div>

          <div className="space-y-3">
            {/* Invariant 1: P1 Ordinality & DAG Branching */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/[0.06]">
              <div className="space-y-0.5">
                <div className="text-xs font-medium text-white flex items-center space-x-2">
                  <span>P1: Monotonic Sequence Ordinality &amp; DAG Fork Invariance</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                    MANDATORY
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400">
                  Enforces strict sequence progression and validates sub-agent parent state pointers. Rollback attacks rejected.
                </div>
              </div>
              <input
                type="checkbox"
                checked={enforceDagLineage}
                onChange={(e) => setEnforceDagLineage(e.target.checked)}
                className="accent-emerald-500 h-4 w-4 cursor-pointer"
              />
            </div>

            {/* Invariant 2: P2 Cross-User Isolation */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/[0.06]">
              <div className="space-y-0.5">
                <div className="text-xs font-medium text-white flex items-center space-x-2">
                  <span>P2: Cross-Tenant &amp; User Session Quarantine</span>
                </div>
                <div className="text-[11px] text-zinc-400">
                  Replays of valid states under different user/tenant identifiers are dropped immediately with HMAC mismatch.
                </div>
              </div>
              <input
                type="checkbox"
                checked={quarantineCrossUser}
                onChange={(e) => setQuarantineCrossUser(e.target.checked)}
                className="accent-emerald-500 h-4 w-4 cursor-pointer"
              />
            </div>

            {/* Invariant 3: P4 In-Process Telemetry Interception */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/40 border border-white/[0.06]">
              <div className="space-y-0.5">
                <div className="text-xs font-medium text-white flex items-center space-x-2">
                  <span>P4: LangChain / LlamaIndex / OTel Memory Interception</span>
                  <span className="text-[10px] font-mono text-zinc-300 bg-zinc-800 border border-white/[0.08] px-1.5 py-0.2 rounded">
                    v1.1 Core
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400">
                  Wraps tracer exports to intercept raw in-memory spans before unsanitized secrets are shipped out-of-band.
                </div>
              </div>
              <input
                type="checkbox"
                checked={interceptTelemetry}
                onChange={(e) => setInterceptTelemetry(e.target.checked)}
                className="accent-emerald-500 h-4 w-4 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Streaming Entropy & Threat Redaction */}
        <div className="glass-panel rounded-xl p-6 space-y-5">
          <div className="flex items-center space-x-2 border-b border-white/[0.06] pb-3">
            <Zap className="h-4 w-4 text-amber-400" />
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-200">
              3. Streaming Entropy Detection Threshold
            </h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-zinc-300">
                Shannon Entropy Anomaly Threshold
              </label>
              <span className="text-sm font-mono font-bold text-white">
                {entropyThreshold.toFixed(1)} bits / char
              </span>
            </div>

            <input
              type="range"
              min="3.0"
              max="5.5"
              step="0.1"
              value={entropyThreshold}
              onChange={(e) => setEntropyThreshold(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />

            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>3.0 (Aggressive - blocks random hex)</span>
              <span>4.2 (Standard production baseline)</span>
              <span>5.5 (Permissive - only high-entropy base64)</span>
            </div>

            <p className="text-xs text-zinc-400 pt-1 leading-relaxed font-sans">
              Sliding 32-character window. Standard English prompt tokens register ~3.2-3.8 bits; high-entropy API keys (OpenAI, AWS, Anthropic) and private keys typically measure &ge; 4.2 bits.
            </p>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-sans font-medium text-xs transition duration-150 active:scale-[0.99]"
          >
            Apply &amp; Distribute Policy
          </button>

          {saved && (
            <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-lg animate-enter-down">
              <Check className="h-3.5 w-3.5" />
              <span>Policy cryptographically signed &amp; applied to running edge gateways</span>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

