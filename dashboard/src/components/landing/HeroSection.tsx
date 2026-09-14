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
  Layers,
} from "lucide-react";

export default function HeroSection() {
  const [copiedCli, setCopiedCli] = useState(false);
  const cliCommand = "npx stateguard scan ./agent_trajectories";

  const handleCopy = () => {
    navigator.clipboard.writeText(cliCommand);
    setCopiedCli(true);
    setTimeout(() => setCopiedCli(false), 2000);
  };

  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 space-y-8">
        {/* Advisory Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-mono backdrop-blur-md shadow-sm animate-enter-down">
          <ShieldAlert className="h-3.5 w-3.5 text-rose-400 shrink-0" />
          <span className="font-semibold uppercase tracking-wider text-[11px]">Security Advisory</span>
          <span className="text-zinc-500">|</span>
          <span className="text-zinc-300 truncate max-w-[280px] sm:max-w-none">
            Cryptographic Contextual Misbinding (arXiv:2608.09867)
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white font-sans leading-[1.08]">
          Zero-Trust State Security for{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
            Autonomous AI Agents
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-base sm:text-lg lg:text-xl text-zinc-400 max-w-3xl mx-auto font-sans leading-relaxed font-normal">
          Frontier reasoning models return chain-of-thought traces as client-held AEAD envelopes. Hera
          intercepts, context-binds, and vaults agent execution state to eliminate data leakage and decryption oracles.
        </p>

        {/* Action Row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          {/* Primary CTA */}
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold font-sans shadow-[0_0_24px_rgba(16,185,129,0.3)] transition duration-150 active:scale-[0.98]"
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
              title="Copy to clipboard"
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
