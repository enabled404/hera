"use client";

import React, { useState } from "react";

export default function SettingsPolicyPage() {
  const [mode, setMode] = useState<"STATEFUL_VAULT" | "STATELESS_BINDING">(
    "STATEFUL_VAULT"
  );
  const [cipherSuite, setCipherSuite] = useState<string>("AES_256_GCM");
  const [vaultTtl, setVaultTtl] = useState<number>(3600);
  const [entropyThreshold, setEntropyThreshold] = useState<number>(4.2);
  const [saved, setSaved] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          Gateway Security Policy & Tenant Configuration
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure architectural state handling, cryptographic binding keys, and entropy detection thresholds.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Architecture Mode Card */}
        <div className="bg-[#0c101c] border border-slate-800 rounded-xl p-6 space-y-4 shadow">
          <h2 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
            1. Reasoning State Security Architecture
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setMode("STATEFUL_VAULT")}
              className={`p-4 rounded-lg border cursor-pointer transition ${
                mode === "STATEFUL_VAULT"
                  ? "bg-indigo-950/40 border-indigo-500 text-white"
                  : "bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="font-semibold text-sm font-mono">
                Stateful Ephemeral Vault (Recommended)
              </div>
              <div className="text-xs text-slate-400 mt-1.5">
                Strips provider reasoning envelopes entirely. Clients receive opaque UUIDv7 / CSPRNG(256-bit) handles stored in-memory with strict TTLs.
              </div>
            </div>

            <div
              onClick={() => setMode("STATELESS_BINDING")}
              className={`p-4 rounded-lg border cursor-pointer transition ${
                mode === "STATELESS_BINDING"
                  ? "bg-indigo-950/40 border-indigo-500 text-white"
                  : "bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="font-semibold text-sm font-mono">
                Stateless Contextual Binding
              </div>
              <div className="text-xs text-slate-400 mt-1.5">
                Wraps tokens in an authenticated outer AEAD envelope bound to $(tenant, user, session, turn, model)$ and HMAC sequence chains.
              </div>
            </div>
          </div>

          {mode === "STATEFUL_VAULT" ? (
            <div className="pt-2">
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Vault State TTL (seconds)
              </label>
              <input
                type="number"
                value={vaultTtl}
                onChange={(e) => setVaultTtl(Number(e.target.value))}
                className="bg-[#070a12] border border-slate-800 rounded-lg px-3 py-1.5 text-sm font-mono text-slate-200 w-48 focus:outline-none focus:border-indigo-500"
              />
            </div>
          ) : (
            <div className="pt-2">
              <label className="block text-xs font-mono text-slate-400 mb-1">
                AEAD Cipher Suite
              </label>
              <select
                value={cipherSuite}
                onChange={(e) => setCipherSuite(e.target.value)}
                className="bg-[#070a12] border border-slate-800 rounded-lg px-3 py-1.5 text-sm font-mono text-slate-200 w-64 focus:outline-none focus:border-indigo-500"
              >
                <option value="AES_256_GCM">AES-256-GCM</option>
                <option value="CHACHA20_POLY1305">ChaCha20-Poly1305</option>
              </select>
            </div>
          )}
        </div>

        {/* Scanner Engine Policy */}
        <div className="bg-[#0c101c] border border-slate-800 rounded-xl p-6 space-y-4 shadow">
          <h2 className="text-sm font-semibold text-white font-mono uppercase tracking-wider">
            2. Streaming Entropy & Secret Redaction
          </h2>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Shannon Entropy Anomaly Threshold (Bits per Character)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="3.0"
                max="5.5"
                step="0.1"
                value={entropyThreshold}
                onChange={(e) => setEntropyThreshold(Number(e.target.value))}
                className="w-64"
              />
              <span className="font-mono text-sm text-indigo-400 font-semibold">
                {entropyThreshold.toFixed(1)} bits
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Sliding 32-character window. Standard text is ~3.5-4.0 bits; base64 tokens & secrets typically &ge; 4.2 bits.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-medium text-sm text-white shadow-lg shadow-indigo-600/20 transition"
          >
            Save Gateway Policy
          </button>

          {saved && (
            <span className="text-xs font-mono text-emerald-400">
              ✓ Policy updated and applied to running gateway
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
