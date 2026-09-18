"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  Github,
  ExternalLink,
  Activity,
  Layers,
  Terminal,
  Sliders,
  BookOpen,
} from "lucide-react";
import HeraLogo from "@/components/ui/HeraLogo";

export default function ConsoleNavbar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Live Threat Stream", href: "/dashboard", icon: Activity },
    { label: "Session DAG", href: "/dashboard/sessions", icon: Layers },
    { label: "Trace Sanitizer", href: "/dashboard/playground", icon: Terminal },
    { label: "Gateway Policy", href: "/dashboard/settings", icon: Sliders },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#050506]/95 backdrop-blur-xl border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Utility Bar */}
        <div className="h-14 flex items-center justify-between border-b border-white/[0.04]">
          {/* Left: Brand + Breadcrumb to Landing */}
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="flex items-center space-x-1.5 text-xs font-mono text-zinc-400 hover:text-white transition px-2 py-1 rounded bg-zinc-900/60 border border-white/[0.06]"
              title="Return to Product Overview"
            >
              <ArrowLeft className="h-3 w-3" />
              <span className="hidden sm:inline">Product Overview</span>
            </Link>

            <span className="text-zinc-700">/</span>

            <div className="flex items-center space-x-2">
              <HeraLogo size={22} glow />
              <span className="text-xs font-bold text-white font-sans tracking-tight">
                Security Operations Center (SOC)
              </span>
              <span className="hidden md:inline-block text-[10px] font-mono text-zinc-500">
                · Reference Gateway Demo
              </span>
            </div>
          </div>

          {/* Right: Live Beacon, Docs, GitHub, Author */}
          <div className="flex items-center space-x-3">
            {/* Live Gateway Beacon */}
            <div className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-[11px] font-mono text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-medium">Gateway Active</span>
              <span className="text-emerald-500/60 hidden sm:inline">· 0.49ms p99</span>
            </div>

            {/* Mode Tag */}
            <span className="hidden lg:inline-block text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-white/[0.08] px-2 py-0.5 rounded">
              STATEFUL_VAULT
            </span>

            {/* Docs link */}
            <Link
              href="/docs"
              className="text-xs font-mono text-zinc-400 hover:text-white transition flex items-center space-x-1"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Docs</span>
            </Link>

            {/* Author Attribution */}
            <a
              href="https://saadkhalidhere.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 pl-2 border-l border-white/[0.08] text-xs font-mono text-zinc-400 hover:text-emerald-400 transition"
              title="Saad Khalid (Lead Architect)"
            >
              <span className="h-5 w-5 rounded-full bg-zinc-800 border border-white/[0.1] text-[10px] font-semibold text-zinc-300 flex items-center justify-center">
                SK
              </span>
            </a>
          </div>
        </div>

        {/* Bottom Navigation Tabs Bar */}
        <div className="flex items-center space-x-1 py-2 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-sans transition shrink-0 ${
                  isActive
                    ? "bg-zinc-850 text-white font-medium shadow-sm border border-white/[0.08]"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-emerald-400" : "text-zinc-500"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
