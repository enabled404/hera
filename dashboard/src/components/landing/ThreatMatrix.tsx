"use client";

import React from "react";
import {
  ShieldAlert,
  KeyRound,
  FileWarning,
  EyeOff,
  Radio,
  ArrowUpRight,
  Lock,
  CheckCircle2,
} from "lucide-react";

interface ThreatVector {
  id: string;
  title: string;
  severity: "CRITICAL" | "HIGH";
  cveRef: string;
  vectorSummary: string;
  exploitMechanic: string;
  heraRemediation: string;
  statusBadge: string;
}

const THREAT_VECTORS: ThreatVector[] = [
  {
    id: "vector-1",
    title: "Asymmetric Decryption Oracles",
    severity: "CRITICAL",
    cveRef: "SG-ADV-2026-001 / CVSS 8.6",
    vectorSummary: "Cross-model state replay forcing smaller reasoning models to decode superior model contexts.",
    exploitMechanic:
      "An attacker captures an opaque reasoning envelope from Claude 3.7 or o3 and replays it into a cheaper endpoint (Claude 3.5 Haiku or 4o-mini). Because providers use uniform AEAD keys across model tiers without binding the model identity to the cipher's Associated Data (AD), the target model decrypts the envelope and reveals internal reasoning or prompt instructions.",
    heraRemediation:
      "Hera binds the model identifier into the cryptographic Associated Data: AD = tenant || user || session || branch || turn || model_id. Replays against mismatched model endpoints fail AEAD authentication immediately with HTTP 403 ModelMismatchViolation.",
    statusBadge: "100% Intercepted (403)",
  },
  {
    id: "vector-2",
    title: "The Sanitization Trap",
    severity: "CRITICAL",
    cveRef: "arXiv:2608.09867 Section 4",
    vectorSummary: "Secrets and credentials removed from visible assistant output remain preserved in client-held state.",
    exploitMechanic:
      "When an agent worker is instructed to purge secrets from code or configs, it generates reasoning tokens inspecting the key before emitting the sanitized code. While the visible chat completion contains no secret, the raw AWS, OpenAI, or JWT credential remains embedded in the client-side reasoning token or OTel span.",
    heraRemediation:
      "In-flight streaming Shannon entropy detection (H(X) ≥ 4.2 bits) and Aho-Corasick token masking. Secrets are scrubbed in the proxy ring-buffer before egress, and client-held reasoning envelopes are swapped for server-side ephemeral UUIDs.",
    statusBadge: "In-Flight Masking",
  },
  {
    id: "vector-3",
    title: "Invisible Prompt Injections",
    severity: "HIGH",
    cveRef: "CWE-94 / OWASP LLM01",
    vectorSummary: "Malicious system instructions injected inside hidden reasoning channels or tool call outputs.",
    exploitMechanic:
      "Attackers place covert adversarial prompts inside third-party webpages or tool outputs processed by agents. The injected instructions poison the agent's internal chain-of-thought, persisting silently across multi-turn workflows without showing up in user chat windows.",
    heraRemediation:
      "Monotonic DAG sequence ratcheting (P1 Invariant) and Merkle tree inclusion proofs. Hera guarantees that child turns can only advance monotonically and forks into isolated sub-agent branches cannot poison the parent conversation root.",
    statusBadge: "Merkle DAG Enforced",
  },
  {
    id: "vector-4",
    title: "Hazardous Refusal Preamble Leaks",
    severity: "HIGH",
    cveRef: "MITRE ATT&CK T1059",
    vectorSummary: "Refusal explanations and safety reasoning blocks disclosing internal security guards and corporate IP.",
    exploitMechanic:
      "When reasoning models refuse unsafe prompts, their raw chain-of-thought often deliberates on company policies, proprietary prompt rules, or internal vulnerability thresholds before outputting a generic canned refusal. Unvaulted traces expose these internal guidelines.",
    heraRemediation:
      "Stateful Ephemeral Vault mode strips provider reasoning envelopes entirely at the edge. The client receives an opaque UUIDv7 handle, guaranteeing that intermediate refusal rationales never touch client storage or browser memory.",
    statusBadge: "Zero Client Egress",
  },
];

export default function ThreatMatrix() {
  return (
    <section id="threat-model" className="py-16 md:py-24 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-950/40 border border-rose-500/30 text-xs font-mono text-rose-300">
            <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
            <span>Formal Threat Matrix</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-sans">
            The 4 Frontier Reasoning State Vulnerabilities
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 font-sans leading-relaxed">
            As documented in <span className="text-zinc-200 font-mono">arXiv:2608.09867</span>, delegating
            cryptographic state preservation to the client opens architectural attack vectors that traditional WAFs cannot detect.
          </p>
        </div>

        {/* 4 Threat Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {THREAT_VECTORS.map((vector) => (
            <div
              key={vector.id}
              className="glass-card rounded-2xl p-6 space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header Tag */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                        vector.severity === "CRITICAL"
                          ? "bg-rose-950/80 border border-rose-500/40 text-rose-300"
                          : "bg-amber-950/80 border border-amber-500/40 text-amber-300"
                      }`}
                    >
                      {vector.severity}
                    </span>
                    <span className="text-xs font-mono text-zinc-500">{vector.cveRef}</span>
                  </div>

                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-0.5 rounded">
                    {vector.statusBadge}
                  </span>
                </div>

                {/* Title & Summary */}
                <div>
                  <h3 className="text-lg font-bold text-white font-sans">{vector.title}</h3>
                  <p className="text-xs font-mono text-zinc-400 mt-1">{vector.vectorSummary}</p>
                </div>

                {/* Exploit Mechanism */}
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-1.5">
                  <div className="text-[11px] font-mono text-rose-400 font-medium uppercase tracking-wider flex items-center space-x-1.5">
                    <FileWarning className="h-3.5 w-3.5" />
                    <span>Attack Vector</span>
                  </div>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    {vector.exploitMechanic}
                  </p>
                </div>
              </div>

              {/* Hera Defense */}
              <div className="pt-3 border-t border-white/[0.06] space-y-1.5">
                <div className="text-[11px] font-mono text-emerald-400 font-medium uppercase tracking-wider flex items-center space-x-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Hera Cryptographic Guarantee</span>
                </div>
                <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                  {vector.heraRemediation}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
