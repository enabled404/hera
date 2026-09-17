"use client";

import React, { useState } from "react";
import {
  Lock,
  Layers,
  Zap,
  Cpu,
  GitBranch,
  ShieldCheck,
  Server,
  Fingerprint,
  ArrowRight,
  CheckCircle2,
  Terminal,
  Activity,
} from "lucide-react";

interface PipelineStage {
  id: string;
  step: string;
  name: string;
  badge: string;
  latency: string;
  icon: React.ElementType;
  description: string;
  cryptoPrimitive: string;
  inboundTransform: string;
  outboundTransform: string;
  invariant: string;
}

const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: "stage_ingress",
    step: "01",
    name: "Header Ingress & Invariant P1",
    badge: "Monotonic Nonce Ratchet",
    latency: "0.02ms",
    icon: Lock,
    description:
      "Validates turn ordinal monotonicity T_(n+1) > T_n and branch ancestry. Rejects state replay and rollback attacks before payload is touched.",
    cryptoPrimitive: "HMAC-SHA256(K_tenant, user_id ∥ session_id ∥ branch_id ∥ H(tau_n))",
    inboundTransform: "Inbound HTTP Header: X-StateGuard-Turn: 4, Hash: 3a91c890...",
    outboundTransform: "Verified monotonic sequence. Branch lane: 'branch_alpha' locked.",
    invariant: "Invariant P1: Monotonic Ordinality & DAG Branch Isolation",
  },
  {
    id: "stage_ad_binding",
    step: "02",
    name: "Context Tuple Binding (P2)",
    badge: "AEAD Associated Data",
    latency: "0.11ms",
    icon: Fingerprint,
    description:
      "Calculates canonical Associated Data (AD) string binding tenant, authenticated user, session, and upstream model tier. Prevents cross-user and cross-model oracle extraction.",
    cryptoPrimitive: "AEAD_AD = tenant_id ∥ user_id ∥ session_id ∥ branch_id ∥ turn ∥ model_id",
    inboundTransform: "Raw envelope payload + Target model: 'claude-3-7-sonnet'",
    outboundTransform: "AD digest verified. Cross-user replay quarantined if user_id differs.",
    invariant: "Invariant P2: Cross-User & Model Lineage Quarantine",
  },
  {
    id: "stage_entropy",
    step: "03",
    name: "Streaming Entropy Scanner (P4)",
    badge: "Shannon H(X) ≥ 4.2",
    latency: "0.24ms",
    icon: Zap,
    description:
      "Stateful ring-buffer scans in-flight tokens with sliding window Shannon entropy and pre-compiled Aho-Corasick patterns, scrubbing API keys in-place before provider transit.",
    cryptoPrimitive: "H(X) = - ∑ P(x_i) log_2 P(x_i) across 32-char sliding frame",
    inboundTransform: '{"api_key": "sk-proj-a99f0183bd78491029c81726a9871029b3c4d5e6f7a8b9c0"}',
    outboundTransform: '{"api_key": "[REDACTED: OPENAI_KEY (H=4.82 bits)]"}',
    invariant: "Invariant P4: In-Process Telemetry & Credential Quarantine",
  },
  {
    id: "stage_vault",
    step: "04",
    name: "Ephemeral Vault / Opaque Egress",
    badge: "UUIDv7 Opaque Handle",
    latency: "0.12ms",
    icon: Server,
    description:
      "Replaces tens of kilobytes of proprietary reasoning tokens with an opaque, AES-256 encrypted handle stored in ephemeral RAM cache with strict TTL eviction.",
    cryptoPrimitive: "AES-256-GCM_K(reasoning_trace) → Redis RAM Vault (TTL: 3600s)",
    inboundTransform: "24,500 bytes of proprietary Chain-of-Thought (CoT) reasoning",
    outboundTransform: 'sgh_0191e4a2-8b3c-7890-a1b2-c3d4e5f6a7b8 (36 bytes)',
    invariant: "Zero Reasoning Egress: Edge Client Protection",
  },
];

export default function ArchitecturePillars() {
  const [selectedStageId, setSelectedStageId] = useState<string>("stage_ad_binding");
  const selectedStage =
    PIPELINE_STAGES.find((s) => s.id === selectedStageId) || PIPELINE_STAGES[0];

  const pillars = [
    {
      number: "01",
      title: "Cryptographic Context Binding",
      icon: Lock,
      badge: "P1 & P2 Invariants",
      headline: "Mathematically binding execution state to tenant, user, and turn ordinality.",
      description:
        "Every client-held state token or envelope is authenticated with hardware-accelerated AES-256-GCM or ChaCha20-Poly1305. The Associated Data (AD) string encapsulates tenant, user, session, branch, turn sequence, and upstream model ID. Replaying a token under another user ID or another model tier causes an immediate HMAC tag mismatch.",
      formula: "AD = tenant_id ∥ user_id ∥ session_id ∥ branch_id ∥ turn_index ∥ model_id",
      details: [
        "Monotonic turn sequence ratcheting prevents state rollback attacks",
        "Sub-agent DAG branch isolation with parent turn witness linking",
        "Subtree Merkle inclusion proofs computed in < 0.05ms",
      ],
    },
    {
      number: "02",
      title: "Ephemeral State Vault",
      icon: Server,
      badge: "Zero Client Egress",
      headline: "Replacing raw client-side reasoning traces with opaque, server-side UUIDv7 handles.",
      description:
        "Instead of returning tens of kilobytes of proprietary model reasoning to edge devices or browser memory, Hera strips provider reasoning blocks and caches them in high-throughput memory (Redis/Dragonfly). Clients receive only an opaque sgh_ handle. For long-running agents where cache TTLs expire, Hera provides an optional AES-256-GCM fallback header.",
      formula: "EncapsulatedState = AES-256-GCM_K(signature ∥ session_metadata)",
      details: [
        "100% elimination of reasoning trace leakage to edge devices",
        "Automatic TTL key eviction prevents memory bloat",
        "Hybrid fallback recovery token in HTTP headers ensures zero dropped turns",
      ],
    },
    {
      number: "03",
      title: "In-Flight Streaming Redactor",
      icon: Zap,
      badge: "< 0.49ms Overhead",
      headline: "Zero-allocation sliding-window Shannon entropy scanner with Aho-Corasick matching.",
      description:
        "Raw server-sent event (SSE) streams are fragmented across TCP and HTTP/2 packets. Hera's stateful ring-buffer framer accumulates tokens up to double-newline delimiters and evaluates sliding Shannon entropy H(X) across a 32-character window. High-entropy API keys, private keys, and JWTs are masked inline before escaping proxy memory.",
      formula: "H(X) = - ∑ P(x_i) log_2 P(x_i)  ≥  4.2 bits / character",
      details: [
        "Pre-compiled Aho-Corasick automaton for OpenAI, AWS, Anthropic keys",
        "10MB event frame DoS protection prevents memory exhaustion attacks",
        "Inter-process OTel span processors intercept traces before APM export",
      ],
    },
  ];

  return (
    <section id="architecture" className="py-16 md:py-24 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono text-cyan-300">
            <Cpu className="h-3.5 w-3.5 text-cyan-400" />
            <span>Zero-Trust SIMD Core</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-sans">
            Engineered for Microsecond Overhead &amp; Zero Breach Tolerance
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 font-sans leading-relaxed">
            Hera executes a 4-stage SIMD-accelerated cryptographic inspection pipeline on every agent turn,
            enforcing zero-trust boundaries in strictly &lt; 0.49ms.
          </p>
        </div>

        {/* Interactive Pipeline Inspector */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider font-semibold">
                Interactive Pipeline Inspector
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white font-sans">
                The StateGuard In-Flight Cryptographic Pipeline
              </h3>
            </div>
            <div className="text-xs font-mono text-zinc-400">
              Total Ingress Budget: <span className="text-emerald-400 font-bold">0.49ms p99</span>
            </div>
          </div>

          {/* Interactive Step Navigator */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PIPELINE_STAGES.map((stg) => {
              const isSelected = stg.id === selectedStage.id;
              const Icon = stg.icon;
              return (
                <div
                  key={stg.id}
                  onClick={() => setSelectedStageId(stg.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-zinc-900 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/20"
                      : "bg-[#09090b]/60 border-white/[0.06] hover:border-white/[0.12] hover:bg-zinc-900/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-zinc-500 font-semibold">
                      Step {stg.step}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 px-1.5 py-0.2 rounded border border-emerald-500/30">
                      {stg.latency}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <Icon className={`h-4 w-4 shrink-0 ${isSelected ? "text-emerald-400" : "text-zinc-400"}`} />
                    <span className="text-xs font-bold text-white truncate font-sans">
                      {stg.name.split(" (")[0]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Expanded Selected Stage Detail */}
          <div className="p-5 rounded-xl bg-black/60 border border-white/[0.08] space-y-4 animate-enter-down">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
              <div className="flex items-center space-x-2.5">
                <selectedStage.icon className="h-4 w-4 text-emerald-400" />
                <h4 className="text-sm font-bold text-white font-sans">{selectedStage.name}</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-white/[0.08]">
                  {selectedStage.badge}
                </span>
              </div>
              <span className="text-xs font-mono text-emerald-400">{selectedStage.invariant}</span>
            </div>

            <p className="text-xs text-zinc-300 font-sans leading-relaxed">
              {selectedStage.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="space-y-1.5 p-3 rounded-lg bg-zinc-950/60 border border-white/[0.05]">
                <span className="text-[10px] uppercase text-zinc-500 font-semibold">
                  Inbound Data Frame
                </span>
                <div className="text-zinc-300 break-all">{selectedStage.inboundTransform}</div>
              </div>

              <div className="space-y-1.5 p-3 rounded-lg bg-zinc-950/60 border border-white/[0.05]">
                <span className="text-[10px] uppercase text-emerald-400 font-semibold">
                  Zero-Trust Transformation
                </span>
                <div className="text-emerald-300 break-all">{selectedStage.outboundTransform}</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/60 border border-white/[0.06] text-[11px] font-mono">
              <span className="text-zinc-400">Cryptographic Operation:</span>
              <span className="text-zinc-200 font-semibold truncate max-w-md select-all">
                {selectedStage.cryptoPrimitive}
              </span>
            </div>
          </div>
        </div>

        {/* 3 Core Architecture Pillars Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.number}
                className="glass-panel rounded-2xl p-6 sm:p-7 space-y-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold font-mono text-zinc-600">{pillar.number}</span>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-0.5 rounded">
                      {pillar.badge}
                    </span>
                  </div>

                  {/* Title & Icon */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded-lg bg-zinc-900 border border-white/[0.08]">
                        <Icon className="h-4 w-4 text-emerald-400" />
                      </div>
                      <h3 className="text-lg font-bold text-white font-sans">{pillar.title}</h3>
                    </div>
                    <p className="text-xs font-mono text-zinc-400">{pillar.headline}</p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    {pillar.description}
                  </p>

                  {/* Formula Box */}
                  <div className="p-3 rounded-xl bg-black/60 border border-white/[0.06] font-mono text-[11px] text-emerald-300 break-all leading-relaxed select-all">
                    {pillar.formula}
                  </div>
                </div>

                {/* Feature Checklist */}
                <div className="pt-4 border-t border-white/[0.06] space-y-2">
                  {pillar.details.map((detail, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-xs text-zinc-300">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
