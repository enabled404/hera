"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ArrowRight,
  Terminal,
  Copy,
  Check,
  Zap,
  Lock,
  Cpu,
  Play,
  RotateCcw,
  ShieldCheck,
  Flame,
} from "lucide-react";

type SimMode = "CLEAN" | "REPLAY" | "SECRET";

export default function HeroSection() {
  const [copiedCli, setCopiedCli] = useState(false);
  const [simMode, setSimMode] = useState<SimMode>("CLEAN");
  const [simRunning, setSimRunning] = useState(false);

  const cliCommand = "npx stateguard scan ./agent_trajectories";

  const handleCopy = () => {
    navigator.clipboard.writeText(cliCommand);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  const runSimulation = (mode: SimMode) => {
    setSimRunning(true);
    setSimMode(mode);
    setTimeout(() => setSimRunning(false), 300);
  };

  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[360px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto text-center px-4 sm:px-6 space-y-8">
        {/* Advisory Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-mono backdrop-blur-md shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
          <span className="font-semibold uppercase tracking-wider text-[11px]">Security Advisory</span>
          <span className="text-zinc-600">|</span>
          <Link
            href="/docs/threat-model"
            className="text-zinc-300 hover:text-white transition underline underline-offset-2 decoration-rose-500/40 truncate max-w-[280px] sm:max-w-none"
          >
            Cryptographic Contextual Misbinding in Reasoning Models (arXiv:2608.09867) &rarr;
          </Link>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-sans leading-[1.08] max-w-5xl mx-auto">
          Zero-Trust State Security for{" "}
          <span className="text-gradient-emerald">
            Autonomous AI Agents
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-base sm:text-lg lg:text-xl text-zinc-400 max-w-3xl mx-auto font-sans leading-relaxed font-normal">
          Frontier reasoning models return chain-of-thought traces as client-held AEAD envelopes. Hera
          intercepts, context-binds, and vaults agent execution state to eliminate data leakage, state tampering, and decryption oracles.
        </p>

        {/* Action Row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          {/* Primary CTA */}
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold font-sans shadow-[0_0_24px_rgba(16,185,129,0.3)] transition duration-150 active:scale-[0.98] btn-shine"
          >
            <span>Explore Live SOC Sandbox</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          {/* Secondary CLI Pill */}
          <div className="w-full sm:w-auto flex items-center justify-between space-x-3 px-4 py-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-850 border border-white/[0.1] text-xs font-mono text-zinc-300 transition shadow-sm">
            <div className="flex items-center space-x-2">
              <Terminal className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-zinc-200">{cliCommand}</span>
            </div>
            <button
              onClick={handleCopy}
              className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
              title="Copy command to clipboard"
            >
              {copiedCli ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          {/* Tertiary Link */}
          <a
            href="mailto:saadkhalid2000@outlook.com?subject=Inquiry:%20StateGuard%20Agent%20Security%20Audit"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-3 rounded-xl text-xs font-mono text-zinc-400 hover:text-white hover:bg-white/[0.04] border border-white/[0.06] transition"
          >
            <span>Book an Agent State Audit</span>
            <ArrowRight className="h-3 w-3 text-zinc-500" />
          </a>
        </div>

        {/* HERO LIVE INTERACTIVE GATEWAY PIPELINE TERMINAL */}
        <div className="pt-6 max-w-4xl mx-auto text-left">
          <div className="glass-panel rounded-2xl overflow-hidden border border-white/[0.12] shadow-2xl">
            {/* Terminal Top Chrome */}
            <div className="px-4 py-3 bg-black/80 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1.5">
                  <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block"></span>
                  <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block"></span>
                  <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block"></span>
                </div>
                <span className="text-xs font-mono text-zinc-400 pl-2 border-l border-white/[0.08]">
                  stateguard-proxy:8080 &bull; SIMD Zero-Copy Ingress
                </span>
              </div>

              {/* Simulation Mode Selector */}
              <div className="flex items-center space-x-1 p-1 rounded-lg bg-zinc-900/90 border border-white/[0.08] text-[11px] font-mono">
                <button
                  onClick={() => runSimulation("CLEAN")}
                  className={`px-2.5 py-1 rounded transition ${
                    simMode === "CLEAN"
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-500/30"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Clean Stream
                </button>
                <button
                  onClick={() => runSimulation("REPLAY")}
                  className={`px-2.5 py-1 rounded transition ${
                    simMode === "REPLAY"
                      ? "bg-rose-950 text-rose-300 border border-rose-500/30"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Replay Attack
                </button>
                <button
                  onClick={() => runSimulation("SECRET")}
                  className={`px-2.5 py-1 rounded transition ${
                    simMode === "SECRET"
                      ? "bg-amber-950 text-amber-300 border border-amber-500/30"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Sanitization Trap
                </button>
              </div>
            </div>

            {/* Terminal Live Output */}
            <div className="p-4 sm:p-5 bg-black/90 font-mono text-xs space-y-2 leading-relaxed">
              {simMode === "CLEAN" && (
                <div className="space-y-1.5">
                  <div className="text-zinc-400">
                    <span className="text-emerald-400">[00:00.012]</span> INBOUND: POST /v1/chat/completions (model: claude-3-7-sonnet)
                  </div>
                  <div className="text-zinc-300">
                    <span className="text-emerald-400">[00:00.042]</span> CONTEXT: Bound AD tuple: tenant:acme-corp | user:usr_alice | sess:sess_491 | branch:main
                  </div>
                  <div className="text-zinc-300">
                    <span className="text-emerald-400">[00:00.118]</span> SCANNER: Sliding Shannon Entropy H(X) = 3.42 bits &lt; 4.2 (Zero secrets detected)
                  </div>
                  <div className="text-zinc-300">
                    <span className="text-emerald-400">[00:00.280]</span> VAULT: Stripped 48.2KB provider thinking envelope &rarr; Ephemeral RAM cache (TTL: 3600s)
                  </div>
                  <div className="text-emerald-400 font-semibold pt-1 border-t border-white/[0.06] flex items-center space-x-1.5">
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    <span>[00:00.412] EGRESS: Emitted sgh_018f3a9b_7c4d handle &bull; Status: 200 OK &bull; Overhead: 0.41ms</span>
                  </div>
                </div>
              )}

              {simMode === "REPLAY" && (
                <div className="space-y-1.5">
                  <div className="text-zinc-400">
                    <span className="text-rose-400">[00:00.010]</span> INBOUND: POST /v1/chat/completions (model: claude-3-7-sonnet)
                  </div>
                  <div className="text-zinc-300">
                    <span className="text-rose-400">[00:00.038]</span> INGRESS: Header user_id: &apos;user-bob&apos; presented state token signed for &apos;user-alice&apos;
                  </div>
                  <div className="text-zinc-300">
                    <span className="text-rose-400">[00:00.095]</span> CRYPTO: Associated Data (AD) HMAC mismatch: 0x9f83a21b != 0x1122a4f9
                  </div>
                  <div className="text-rose-300 font-semibold pt-1 border-t border-white/[0.06] flex items-center space-x-1.5">
                    <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400" />
                    <span>[00:00.380] INTERCEPTED: HTTP 403 StateIntegrityViolation &bull; Dropped connection &bull; Zero bytes forwarded</span>
                  </div>
                </div>
              )}

              {simMode === "SECRET" && (
                <div className="space-y-1.5">
                  <div className="text-zinc-400">
                    <span className="text-amber-400">[00:00.014]</span> INBOUND: Code Refactor prompt &bull; Agent inspected config.json containing production credentials
                  </div>
                  <div className="text-zinc-300">
                    <span className="text-amber-400">[00:00.056]</span> SCANNER: Shannon Entropy peak detected: H(X) = 4.41 bits &ge; 4.2 threshold
                  </div>
                  <div className="text-zinc-300">
                    <span className="text-amber-400">[00:00.142]</span> REDACTION: Aho-Corasick match on &apos;AKIAIOSFODNN7EXAMPLE&apos; in thinking envelope
                  </div>
                  <div className="text-amber-300 font-semibold pt-1 border-t border-white/[0.06] flex items-center space-x-1.5">
                    <Zap className="h-4 w-4 shrink-0 text-amber-400" />
                    <span>[00:00.420] SANITIZED: Replaced key with [REDACTED: AWS_ACCESS_KEY] &bull; Vaulted into sgh_018f3a9b &bull; 0.42ms</span>
                  </div>
                </div>
              )}
            </div>

            {/* Terminal Bottom Action Bar */}
            <div className="px-4 py-2 bg-zinc-950 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-zinc-500">
              <span className="flex items-center space-x-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                <span>Active Protection: P1 Ordinality &bull; P2 User Quarantine &bull; P4 In-Process Telemetry</span>
              </span>
              <Link href="/dashboard" className="text-emerald-400 hover:text-emerald-300 transition flex items-center space-x-1">
                <span>Launch Full SOC &rarr;</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Micro Proof Stats */}
        <div className="pt-8 border-t border-white/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
          <div className="text-center space-y-0.5">
            <div className="text-lg sm:text-xl font-bold font-mono text-white">&lt; 0.49ms</div>
            <div className="text-[11px] font-mono text-zinc-500">p99 Streaming Overhead</div>
          </div>
          <div className="text-center space-y-0.5">
            <div className="text-lg sm:text-xl font-bold font-mono text-emerald-400">100% Blocked</div>
            <div className="text-[11px] font-mono text-zinc-500">Replay &amp; Downgrade Traps</div>
          </div>
          <div className="text-center space-y-0.5">
            <div className="text-lg sm:text-xl font-bold font-mono text-white">Zero Leakage</div>
            <div className="text-[11px] font-mono text-zinc-500">Ephemeral Vault Mode</div>
          </div>
          <div className="text-center space-y-0.5">
            <div className="text-lg sm:text-xl font-bold font-mono text-zinc-300">Apache 2.0</div>
            <div className="text-[11px] font-mono text-zinc-500">Open-Source Rust Core</div>
          </div>
        </div>
      </div>
    </section>
  );
}
