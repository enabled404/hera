"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  Activity,
  Github,
  ExternalLink,
  Cpu,
  Layers,
  Sliders,
  Terminal,
  Sparkles,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Live Threat Feed", icon: Activity },
    { href: "/sessions", label: "Session & Merkle DAG", icon: Layers },
    { href: "/playground", label: "Trace Sanitizer", icon: Terminal },
    { href: "/settings", label: "Gateway Policy", icon: Sliders },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#050507]/75 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo & Meta Badges */}
        <div className="flex items-center space-x-3.5">
          <Link href="/" className="group flex items-center space-x-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-purple-600 p-[1px] shadow-[0_0_20px_rgba(6,182,212,0.35)] transition duration-300 group-hover:shadow-[0_0_25px_rgba(6,182,212,0.6)]">
              <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[#07070a]">
                <Shield className="h-4 w-4 text-cyan-400 transition group-hover:scale-110" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="font-bold tracking-tight text-white text-base leading-tight font-sans">
                  HERA
                </span>
                <span className="text-[10px] tracking-wider text-slate-400 font-mono">
                  STATEGUARD
                </span>
              </div>
              <span className="text-[9px] text-cyan-400/90 font-mono tracking-widest uppercase">
                ZERO-TRUST GATEWAY
              </span>
            </div>
          </Link>

          <span className="inline-flex items-center rounded-full bg-cyan-950/40 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-mono text-cyan-300">
            v1.1.0-prod
          </span>

          <a
            href="https://github.com/enabled404/hera"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center space-x-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] px-2.5 py-0.5 text-xs text-slate-300 hover:text-white transition"
          >
            <Github className="h-3.5 w-3.5" />
            <span className="font-mono text-[11px]">enabled404/hera</span>
          </a>
        </div>

        {/* Center: Segmented Navigation Pills */}
        <nav className="hidden md:flex items-center p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-white/[0.1] text-white shadow-sm border border-white/[0.1]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Status Beacons & Maintainer Badge */}
        <div className="flex items-center space-x-3">
          {/* Gateway Status Pill */}
          <div className="hidden lg:flex items-center space-x-2 rounded-full bg-emerald-950/30 border border-emerald-500/30 px-3 py-1 text-xs font-mono text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="tabular-nums">Active (p99: 0.49ms)</span>
          </div>

          {/* Mode Pill */}
          <div className="hidden sm:flex items-center space-x-1.5 rounded-full bg-indigo-950/30 border border-indigo-500/30 px-2.5 py-1 text-[11px] font-mono text-indigo-300">
            <Cpu className="h-3 w-3 text-indigo-400" />
            <span>STATEFUL_VAULT</span>
          </div>

          {/* Architect Profile Link */}
          <a
            href="https://saadkhalidhere.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 rounded-full bg-gradient-to-r from-zinc-900 to-zinc-800 hover:from-zinc-800 hover:to-zinc-700 border border-white/[0.1] px-2.5 py-1 text-xs font-medium text-slate-200 transition group"
            title="Architect Portfolio"
          >
            <span className="h-4 w-4 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-[9px] font-bold text-white">
              SK
            </span>
            <span className="hidden sm:inline text-xs font-sans text-slate-300 group-hover:text-white">
              Saad Khalid
            </span>
            <ExternalLink className="h-3 w-3 text-slate-500 group-hover:text-slate-300" />
          </a>
        </div>
      </div>
    </header>
  );
}
