"use client";

import React from "react";
import { Gauge, Check, X, Shield, Activity, Zap, Cpu } from "lucide-react";

export default function BenchmarkGrid() {
  const benchmarkRows = [
    {
      metric: "p50 Interception Latency",
      hera: "0.042 ms",
      cloudflare: "1.200 ms",
      traditionalWaf: "14.50 ms",
      highlight: true,
    },
    {
      metric: "p90 Stream Evaluation",
      hera: "0.118 ms",
      cloudflare: "2.400 ms",
      traditionalWaf: "28.00 ms",
      highlight: true,
    },
    {
      metric: "p99 Maximum Overhead",
      hera: "0.490 ms (SLA ≤ 3.5ms)",
      cloudflare: "4.800 ms",
      traditionalWaf: "62.00 ms",
      highlight: true,
    },
    {
      metric: "Throughput / Core",
      hera: "> 45,000 req/sec",
      cloudflare: "~ 8,500 req/sec",
      traditionalWaf: "~ 1,200 req/sec",
      highlight: false,
    },
    {
      metric: "Memory Footprint (RSS)",
      hera: "< 18 MB",
      cloudflare: "Managed Edge",
      traditionalWaf: "180 - 450 MB",
      highlight: false,
    },
    {
      metric: "Streaming Reasoning Decryption",
      hera: "Zero-Copy SIMD Ring-Buffer",
      cloudflare: "Buffering Delays",
      traditionalWaf: "Stream Broken",
      highlight: false,
    },
    {
      metric: "Cross-Model Replay Prevention",
      hera: "Cryptographic AD Tuple Binding",
      cloudflare: "None (Raw Pass)",
      traditionalWaf: "None (Token Blind)",
      highlight: false,
    },
  ];

  return (
    <section id="benchmarks" className="py-16 md:py-24 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-xs font-mono text-emerald-300">
            <Gauge className="h-3.5 w-3.5 text-emerald-400" />
            <span>Empirical Benchmarks</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-sans">
            Sub-Millisecond Overhead with Industrial Headroom
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 font-sans leading-relaxed">
            Hera operates entirely in-process and at the transport layer, verifying monotonic turns and
            evaluating Shannon entropy without buffering delays or garbage collection pauses.
          </p>
        </div>

        {/* 4 Quick Stat Callouts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card rounded-xl p-5 space-y-2">
            <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Median Overhead</div>
            <div className="text-3xl font-extrabold font-mono text-white">0.042 ms</div>
            <div className="text-xs text-emerald-400 font-mono flex items-center space-x-1">
              <Zap className="h-3 w-3" />
              <span>SIMD AEAD decrypt &amp; verify</span>
            </div>
          </div>

          <div className="glass-card rounded-xl p-5 space-y-2">
            <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider">p99 Tail Latency</div>
            <div className="text-3xl font-extrabold font-mono text-emerald-400">0.490 ms</div>
            <div className="text-xs text-zinc-400 font-mono">
              <span>7.1x headroom against 3.5ms SLA</span>
            </div>
          </div>

          <div className="glass-card rounded-xl p-5 space-y-2">
            <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Streaming Throughput</div>
            <div className="text-3xl font-extrabold font-mono text-white">&gt; 45k req/s</div>
            <div className="text-xs text-zinc-400 font-mono">
              <span>Single commodity 4-core instance</span>
            </div>
          </div>

          <div className="glass-card rounded-xl p-5 space-y-2">
            <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Static Binary Footprint</div>
            <div className="text-3xl font-extrabold font-mono text-white">&lt; 18 MB</div>
            <div className="text-xs text-zinc-400 font-mono">
              <span>Zero external C runtimes</span>
            </div>
          </div>
        </div>

        {/* Detailed Comparison Table */}
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/[0.08]">
          <div className="p-4 sm:p-5 border-b border-white/[0.06] flex items-center justify-between">
            <span className="text-xs font-mono font-medium uppercase tracking-wider text-zinc-300 flex items-center space-x-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              <span>Architectural Performance Matrix</span>
            </span>
            <span className="text-[11px] font-mono text-zinc-500">Hardware: Linux x86_64 / Apple Silicon</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs">
              <thead className="bg-black/60 text-zinc-400 font-mono uppercase text-[10px] tracking-wider border-b border-white/[0.06]">
                <tr>
                  <th className="py-3 px-4 sm:px-6">Metric / Capability</th>
                  <th className="py-3 px-4 sm:px-6 text-emerald-400 bg-emerald-950/20">
                    Hera (StateGuard v1.1)
                  </th>
                  <th className="py-3 px-4 sm:px-6">Edge AI Gateways</th>
                  <th className="py-3 px-4 sm:px-6">Legacy Cloud WAF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] font-mono text-[11px]">
                {benchmarkRows.map((row, i) => (
                  <tr
                    key={i}
                    className="hover:bg-white/[0.02] transition"
                  >
                    <td className="py-3.5 px-4 sm:px-6 font-medium text-zinc-200 font-sans">
                      {row.metric}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-emerald-300 bg-emerald-950/10">
                      {row.hera}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-zinc-400">{row.cloudflare}</td>
                    <td className="py-3.5 px-4 sm:px-6 text-zinc-500">{row.traditionalWaf}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
