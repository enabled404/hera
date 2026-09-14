"use client";

import React from "react";
import {
  Lock,
  Layers,
  Zap,
  Cpu,
  GitBranch,
  ShieldCheck,
  Server,
  Fingerprint,
} from "lucide-react";

export default function ArchitecturePillars() {
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono text-cyan-300">
            <Cpu className="h-3.5 w-3.5 text-cyan-400" />
            <span>Core System Pillars</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-sans">
            Engineered for Microsecond Overhead &amp; Zero Breach Tolerance
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 font-sans leading-relaxed">
            Hera is written entirely in pure, memory-safe Rust with SIMD-accelerated cryptography,
            delivering enterprise zero-trust enforcement without slowing down reasoning streams.
          </p>
        </div>

        {/* Pillars Cards */}
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
