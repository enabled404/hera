"use client";

import React from "react";
import { ShieldAlert, ShieldCheck, Key, Zap, TrendingUp } from "lucide-react";

interface MetricCardsProps {
  inspectedTurns: number;
  attacksBlocked: number;
  secretsRedacted: number;
  latencyMs: number;
  highlightCard?: "ATTACK" | "SECRET" | null;
}

export default function MetricCards({
  inspectedTurns,
  attacksBlocked,
  secretsRedacted,
  latencyMs,
  highlightCard,
}: MetricCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Inspected Turns */}
      <div className="relative group overflow-hidden rounded-2xl glass-panel p-5 transition-all hover:border-white/[0.18]">
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition duration-500" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-medium text-slate-400 tracking-wider uppercase">
            Inspected Turns
          </span>
          <span className="inline-flex items-center space-x-1 rounded-md bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-mono text-cyan-300">
            <TrendingUp className="h-2.5 w-2.5" />
            <span>+12.4%</span>
          </span>
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-3xl font-bold font-mono tracking-tight text-white tabular-nums">
            {inspectedTurns.toLocaleString()}
          </span>
        </div>

        {/* SVG Mini-Sparkline */}
        <div className="mt-3 pt-2 border-t border-white/[0.05] flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-500">24h SSE Volume</span>
          <svg className="w-24 h-6 overflow-visible" viewBox="0 0 100 24" fill="none">
            <defs>
              <linearGradient id="cyanSparkline" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M0 18 L15 14 L30 16 L45 9 L60 12 L75 5 L90 8 L100 3 L100 24 L0 24 Z"
              fill="url(#cyanSparkline)"
            />
            <path
              d="M0 18 L15 14 L30 16 L45 9 L60 12 L75 5 L90 8 L100 3"
              stroke="#06b6d4"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* 2. Attacks Intercepted */}
      <div
        className={`relative group overflow-hidden rounded-2xl glass-panel p-5 transition-all ${
          highlightCard === "ATTACK"
            ? "border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.3)] bg-rose-950/20"
            : "hover:border-rose-500/40"
        }`}
      >
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition duration-500" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-medium text-rose-300/90 tracking-wider uppercase flex items-center space-x-1.5">
            <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
            <span>Attacks Intercepted</span>
          </span>
          <span className="inline-flex items-center rounded-md bg-rose-950/70 border border-rose-500/40 px-2 py-0.5 text-[10px] font-mono text-rose-300 font-semibold">
            100% BLOCKED
          </span>
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-3xl font-bold font-mono tracking-tight text-rose-100 tabular-nums">
            {attacksBlocked}
          </span>
          <span className="text-[11px] font-mono text-rose-400/80">HTTP 403 Dropped</span>
        </div>

        <div className="mt-3 pt-2 border-t border-white/[0.05] flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="truncate">112 Replays &bull; 72 Lineage</span>
          <span className="text-rose-400 font-medium">Zero Leakage</span>
        </div>
      </div>

      {/* 3. Secrets Redacted */}
      <div
        className={`relative group overflow-hidden rounded-2xl glass-panel p-5 transition-all ${
          highlightCard === "SECRET"
            ? "border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.3)] bg-amber-950/20"
            : "hover:border-amber-500/40"
        }`}
      >
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition duration-500" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-medium text-amber-300/90 tracking-wider uppercase flex items-center space-x-1.5">
            <Key className="h-3.5 w-3.5 text-amber-400" />
            <span>Secrets Redacted</span>
          </span>
          <span className="inline-flex items-center rounded-md bg-amber-950/70 border border-amber-500/40 px-2 py-0.5 text-[10px] font-mono text-amber-300">
            H(X) &ge; 4.2
          </span>
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-3xl font-bold font-mono tracking-tight text-amber-100 tabular-nums">
            {secretsRedacted.toLocaleString()}
          </span>
          <span className="text-[11px] font-mono text-amber-400/80">In-Flight Scrubbed</span>
        </div>

        <div className="mt-3 pt-2 border-t border-white/[0.05] flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="truncate">AWS &bull; OpenAI &bull; Anthropic &bull; DB</span>
          <span className="text-amber-400 font-medium">Clean Traces</span>
        </div>
      </div>

      {/* 4. Gateway Latency */}
      <div className="relative group overflow-hidden rounded-2xl glass-panel p-5 transition-all hover:border-emerald-500/40">
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition duration-500" />
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-medium text-emerald-300/90 tracking-wider uppercase flex items-center space-x-1.5">
            <Zap className="h-3.5 w-3.5 text-emerald-400" />
            <span>Proxy Latency (p99)</span>
          </span>
          <span className="inline-flex items-center rounded-md bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-mono text-emerald-300">
            &le; 3.5ms SLA
          </span>
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <div className="flex items-baseline space-x-1">
            <span className="text-3xl font-bold font-mono tracking-tight text-emerald-300 tabular-nums">
              {latencyMs.toFixed(2)}
            </span>
            <span className="text-sm font-mono text-emerald-400/70">ms</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400">7.1x Headroom</span>
        </div>

        {/* Speed Gauge SLA Bar */}
        <div className="mt-3 pt-2 border-t border-white/[0.05]">
          <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (latencyMs / 3.5) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
            <span>0.04ms (p50)</span>
            <span>Target: 3.50ms</span>
          </div>
        </div>
      </div>
    </div>
  );
}
