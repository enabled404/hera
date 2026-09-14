"use client";

import React from "react";
import { ShieldAlert, Key, Zap, TrendingUp, ShieldCheck } from "lucide-react";

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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {/* Card 1: Total Ingestion */}
      <div className="glass-card rounded-xl p-5 flex flex-col justify-between space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono tracking-wider text-zinc-400 uppercase">
            Total Ingestion
          </span>
          <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
            <TrendingUp className="h-2.5 w-2.5 mr-0.5" />
            <span>+12.4% 24h</span>
          </span>
        </div>

        <div>
          <span className="text-3xl font-semibold tracking-tight text-white font-mono tabular-nums">
            {inspectedTurns.toLocaleString()}
          </span>
        </div>

        <div className="text-xs text-zinc-400 font-sans truncate">
          Zero-copy SSE stream validation
        </div>
      </div>

      {/* Card 2: Attacks Neutralized */}
      <div
        className={`glass-card rounded-xl p-5 flex flex-col justify-between space-y-4 transition-all duration-300 ${
          highlightCard === "ATTACK"
            ? "border-rose-500/80 bg-rose-950/20 shadow-[0_0_25px_rgba(244,63,94,0.25)]"
            : ""
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono tracking-wider text-zinc-400 uppercase">
            Attacks Neutralized
          </span>
          <span className="inline-flex items-center rounded-full bg-rose-950/50 border border-rose-500/30 px-2 py-0.5 text-[10px] font-mono text-rose-400 font-medium">
            100% Blocked
          </span>
        </div>

        <div>
          <span className="text-3xl font-semibold tracking-tight text-white font-mono tabular-nums">
            {attacksBlocked}
          </span>
        </div>

        <div className="text-xs text-zinc-400 font-sans truncate">
          112 Replays &middot; 72 Model Downgrades
        </div>
      </div>

      {/* Card 3: Trapped Secrets Scrubbed */}
      <div
        className={`glass-card rounded-xl p-5 flex flex-col justify-between space-y-4 transition-all duration-300 ${
          highlightCard === "SECRET"
            ? "border-amber-500/80 bg-amber-950/20 shadow-[0_0_25px_rgba(245,158,11,0.25)]"
            : ""
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono tracking-wider text-zinc-400 uppercase">
            Trapped Secrets Scrubbed
          </span>
          <span className="inline-flex items-center rounded-full bg-amber-950/50 border border-amber-500/30 px-2 py-0.5 text-[10px] font-mono text-amber-300 font-medium">
            H(X) &ge; 4.2
          </span>
        </div>

        <div>
          <span className="text-3xl font-semibold tracking-tight text-white font-mono tabular-nums">
            {secretsRedacted.toLocaleString()}
          </span>
        </div>

        <div className="text-xs text-zinc-400 font-sans truncate">
          Redacted in-flight before APM egress
        </div>
      </div>

      {/* Card 4: p99 Processing Latency */}
      <div className="glass-card rounded-xl p-5 flex flex-col justify-between space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono tracking-wider text-zinc-400 uppercase">
            p99 Processing Latency
          </span>
          <span className="inline-flex items-center rounded-full bg-cyan-950/50 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-mono text-cyan-300 font-medium">
            SLA &le; 3.5ms
          </span>
        </div>

        <div className="flex items-baseline space-x-1">
          <span className="text-3xl font-semibold tracking-tight text-white font-mono tabular-nums">
            {latencyMs.toFixed(2)}
          </span>
          <span className="text-sm font-mono text-zinc-400">ms</span>
        </div>

        <div className="space-y-1.5">
          <div className="text-xs text-zinc-400 font-sans truncate">
            p50: 0.04ms &middot; 7.1x Headroom
          </div>
          {/* Sleek 2px progress bar beneath showing 0.49ms against 3.5ms */}
          <div className="w-full bg-zinc-800/80 rounded-full h-[2px] overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (latencyMs / 3.5) * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

