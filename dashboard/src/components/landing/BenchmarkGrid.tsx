"use client";

import React, { useState } from "react";
import { Gauge, Check, X, Shield, Activity, Zap, Cpu, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function BenchmarkGrid() {
  const [concurrency, setConcurrency] = useState<"100" | "1000" | "10000">("1000");

  const concurrencyStats = {
    "100": { p50: "0.038 ms", p90: "0.082 ms", p99: "0.240 ms", throughput: "48,200 req/s" },
    "1000": { p50: "0.042 ms", p90: "0.118 ms", p99: "0.490 ms", throughput: "45,400 req/s" },
    "10000": { p50: "0.075 ms", p90: "0.210 ms", p99: "0.880 ms", throughput: "41,800 req/s" },
  };

  const currentStats = concurrencyStats[concurrency];

  const latencyBars = [
    { name: "Hera StateGuard v1.1", latency: 0.49, color: "bg-emerald-400", label: "0.49 ms (p99 SLA ≤ 3.5ms)", highlight: true },
    { name: "Cloudflare AI Gateway", latency: 4.80, color: "bg-cyan-400", label: "4.80 ms", highlight: false },
    { name: "AWS API Gateway + Lambda", latency: 18.20, color: "bg-amber-400", label: "18.20 ms", highlight: false },
    { name: "Traditional Enterprise Cloud WAF", latency: 62.00, color: "bg-rose-500", label: "62.00 ms", highlight: false },
  ];

  return (
    <section id="benchmarks" className="py-16 md:py-24 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-xs font-mono text-emerald-300">
            <Gauge className="h-3.5 w-3.5 text-emerald-400" />
            <span>Empirical Transport Benchmarks</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-sans">
            Sub-Millisecond Overhead with Industrial Headroom
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 font-sans leading-relaxed">
            Hera operates entirely in pure Rust at the transport layer with SIMD-accelerated AEAD encryption
            and zero-allocation ring-buffers. Zero garbage collection pauses.
          </p>
        </div>

        {/* Visual Latency Comparison Bar Chart */}
        <div className="glass-panel rounded-2xl p-6 sm:p-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
            <div>
              <h3 className="text-sm font-bold text-white font-sans uppercase tracking-wider flex items-center space-x-2">
                <Activity className="h-4 w-4 text-emerald-400" />
                <span>p99 Transport Latency Comparison (Lower is Better)</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5 font-sans">
                Measured across 100,000 synthetic reasoning turns streaming over HTTP/2.
              </p>
            </div>

            {/* Concurrency Selector */}
            <div className="flex items-center space-x-1 p-1 rounded-lg bg-black/60 border border-white/[0.08] text-xs font-mono self-start sm:self-auto">
              <span className="text-zinc-500 px-2">Concurrency:</span>
              {(["100", "1000", "10000"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setConcurrency(c)}
                  className={`px-2.5 py-1 rounded transition ${
                    concurrency === c
                      ? "bg-zinc-800 text-white font-medium shadow-sm border border-white/[0.1]"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Visual Horizontal Bars */}
          <div className="space-y-4 pt-1">
            {latencyBars.map((bar, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className={bar.highlight ? "text-white font-bold" : "text-zinc-400"}>
                    {bar.name}
                  </span>
                  <span className={bar.highlight ? "text-emerald-400 font-bold" : "text-zinc-400"}>
                    {bar.label}
                  </span>
                </div>
                <div className="w-full bg-zinc-900/80 rounded-full h-2.5 overflow-hidden p-0.5 border border-white/[0.04]">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${bar.color}`}
                    style={{
                      width: `${Math.max(2, Math.min(100, (bar.latency / 62.0) * 100))}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Micro Stats for Current Concurrency */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/[0.06] text-xs font-mono">
            <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
              <span className="text-[10px] text-zinc-500 uppercase block">Median (p50)</span>
              <span className="text-white font-bold text-base">{currentStats.p50}</span>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
              <span className="text-[10px] text-zinc-500 uppercase block">90th Percentile</span>
              <span className="text-white font-bold text-base">{currentStats.p90}</span>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
              <span className="text-[10px] text-zinc-500 uppercase block">99th Percentile</span>
              <span className="text-emerald-400 font-bold text-base">{currentStats.p99}</span>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06]">
              <span className="text-[10px] text-zinc-500 uppercase block">Throughput / Core</span>
              <span className="text-white font-bold text-base">{currentStats.throughput}</span>
            </div>
          </div>
        </div>

        {/* Feature Matrix Table */}
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/[0.08]">
          <div className="p-4 sm:p-5 border-b border-white/[0.06] flex items-center justify-between">
            <span className="text-xs font-mono font-medium uppercase tracking-wider text-zinc-300 flex items-center space-x-2">
              <Cpu className="h-4 w-4 text-emerald-400" />
              <span>Architectural Feature Matrix</span>
            </span>
            <span className="text-[11px] font-mono text-zinc-500">Hardware: Linux x86_64 / Apple Silicon</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs">
              <thead className="bg-black/60 text-zinc-400 font-mono uppercase text-[10px] tracking-wider border-b border-white/[0.06]">
                <tr>
                  <th className="py-3 px-4 sm:px-6">Capability</th>
                  <th className="py-3 px-4 sm:px-6 text-emerald-400 bg-emerald-950/20">
                    Hera (StateGuard v1.1)
                  </th>
                  <th className="py-3 px-4 sm:px-6">Edge AI Gateways</th>
                  <th className="py-3 px-4 sm:px-6">Legacy Cloud WAF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] font-mono text-[11px]">
                <tr className="hover:bg-white/[0.02] transition">
                  <td className="py-3.5 px-4 sm:px-6 font-medium text-zinc-200 font-sans">
                    Reasoning State Vaulting
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-emerald-300 bg-emerald-950/10">
                    Server-Side RAM (Redis/Dragonfly)
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-zinc-400">Client-Held Plaintext</td>
                  <td className="py-3.5 px-4 sm:px-6 text-zinc-500">Unsupported</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition">
                  <td className="py-3.5 px-4 sm:px-6 font-medium text-zinc-200 font-sans">
                    Streaming Shannon Entropy Scanner
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-emerald-300 bg-emerald-950/10">
                    32-char sliding H(X) ≥ 4.2 bits
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-zinc-400">Post-generation only</td>
                  <td className="py-3.5 px-4 sm:px-6 text-zinc-500">Regex only (Truncates)</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition">
                  <td className="py-3.5 px-4 sm:px-6 font-medium text-zinc-200 font-sans">
                    Model Lineage &amp; Replay Prevention
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-emerald-300 bg-emerald-950/10">
                    Associated Data Tuple (AD)
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-zinc-400">None (Token blind)</td>
                  <td className="py-3.5 px-4 sm:px-6 text-zinc-500">None</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition">
                  <td className="py-3.5 px-4 sm:px-6 font-medium text-zinc-200 font-sans">
                    Agent DAG / Sub-agent Branching
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 font-bold text-emerald-300 bg-emerald-950/10">
                    Merkle Tree Witness Proofs
                  </td>
                  <td className="py-3.5 px-4 sm:px-6 text-zinc-400">Sequence rejection</td>
                  <td className="py-3.5 px-4 sm:px-6 text-zinc-500">Unsupported</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
