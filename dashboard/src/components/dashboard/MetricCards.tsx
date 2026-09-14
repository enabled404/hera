"use client";

import React from "react";
import { ShieldCheck, ShieldAlert, KeyRound, Zap } from "lucide-react";

interface MetricCardsProps {
  stats: {
    totalInspected: number;
    attacksBlocked: number;
    secretsRedacted: number;
    p99LatencyMs: number;
  };
}

export default function MetricCards({ stats }: MetricCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Total Turns Inspected */}
      <div className="glass-card rounded-xl p-5 flex flex-col justify-between space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">
            Total Ingestion
          </span>
          <span className="inline-flex items-center text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-white/[0.06]">
            +12.4% 24h
          </span>
        </div>

        <div className="space-y-1">
          <div className="text-3xl font-bold font-mono text-white tracking-tight tabular-nums">
            {stats.totalInspected.toLocaleString()}
          </div>
          <p className="text-[11px] font-mono text-zinc-400">
            Zero-copy SSE stream validation
          </p>
        </div>

        {/* Mini SVG Sparkline */}
        <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between">
          <svg className="w-full h-5 text-emerald-400/50" fill="none" viewBox="0 0 100 20">
            <path
              d="M0 15 Q 15 5, 30 12 T 60 8 T 85 4 L 100 2"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>
      </div>

      {/* Card 2: Attacks Blocked */}
      <div className="glass-card rounded-xl p-5 flex flex-col justify-between space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">
            Attacks Blocked
          </span>
          <span className="inline-flex items-center text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/60 border border-rose-500/30 text-rose-300 font-medium">
            100% Intercepted (403)
          </span>
        </div>

        <div className="space-y-1">
          <div className="text-3xl font-bold font-mono text-white tracking-tight tabular-nums">
            {stats.attacksBlocked.toLocaleString()}
          </div>
          <p className="text-[11px] font-mono text-zinc-400">
            112 Replays &bull; 72 Model Downgrades
          </p>
        </div>

        {/* Mini SVG Sparkline */}
        <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between">
          <svg className="w-full h-5 text-rose-400/50" fill="none" viewBox="0 0 100 20">
            <path
              d="M0 18 Q 20 18, 40 14 T 70 8 T 90 4 L 100 2"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>
      </div>

      {/* Card 3: Secrets Redacted */}
      <div className="glass-card rounded-xl p-5 flex flex-col justify-between space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">
            Secrets Redacted
          </span>
          <span className="inline-flex items-center text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 text-amber-300 font-medium">
            H(X) ≥ 4.2
          </span>
        </div>

        <div className="space-y-1">
          <div className="text-3xl font-bold font-mono text-white tracking-tight tabular-nums">
            {stats.secretsRedacted.toLocaleString()}
          </div>
          <p className="text-[11px] font-mono text-zinc-400">
            Scrubbed before APM/Datadog egress
          </p>
        </div>

        {/* Mini SVG Sparkline */}
        <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between">
          <svg className="w-full h-5 text-amber-400/50" fill="none" viewBox="0 0 100 20">
            <path
              d="M0 16 Q 25 10, 50 14 T 75 6 L 100 4"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>
      </div>

      {/* Card 4: Stream Latency Overhead */}
      <div className="glass-card rounded-xl p-5 flex flex-col justify-between space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">
            Stream Latency Overhead
          </span>
          <span className="inline-flex items-center text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-medium">
            SLA ≤ 3.5ms
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline space-x-1.5">
            <span className="text-3xl font-bold font-mono text-white tracking-tight tabular-nums">
              {stats.p99LatencyMs.toFixed(2)}
            </span>
            <span className="text-xs font-mono text-zinc-500">ms (p99)</span>
          </div>

          <div className="space-y-1">
            <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-400 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (stats.p99LatencyMs / 3.5) * 100)}%` }}
              ></div>
            </div>
            <div className="text-[10px] font-mono text-zinc-500">
              p50: 0.04ms &bull; 7.1x Headroom
            </div>
          </div>
        </div>

        {/* Mini SVG Sparkline */}
        <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between">
          <svg className="w-full h-5 text-emerald-400/50" fill="none" viewBox="0 0 100 20">
            <path
              d="M0 10 Q 25 12, 50 8 T 75 11 L 100 9"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
