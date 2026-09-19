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
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

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
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            <Link
              href="/"
              className="touch-target flex items-center space-x-1.5 text-xs font-mono text-zinc-400 hover:text-white transition px-2.5 py-1.5 rounded-lg bg-zinc-900/60 border border-white/[0.06] active-spring shrink-0"
              title="Return to Product Overview"
            >
              <ArrowLeft className="h-3 w-3" />
              <span className="hidden sm:inline">Overview</span>
            </Link>

            <span className="text-zinc-700 hidden sm:inline">/</span>

            <div className="flex items-center space-x-2 min-w-0">
              <HeraLogo size={22} glow />
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 min-w-0">
                <span className="text-xs font-bold text-white font-sans tracking-tight truncate">
                  <span className="hidden sm:inline">Security Operations Center (SOC)</span>
                  <span className="sm:hidden">SOC Console</span>
                </span>
                <span className="hidden md:inline-block text-[10px] font-mono text-zinc-500">
                  · Reference Gateway Demo
                </span>
              </div>
            </div>
          </div>

          {/* Right: Live Beacon, Docs, Author, Mobile Menu Toggle */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* Live Gateway Beacon */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 px-2 sm:px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-[10px] sm:text-[11px] font-mono text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-medium hidden xs:inline">Active</span>
              <span className="text-emerald-500/60 hidden sm:inline">· 0.49ms p99</span>
            </div>

            {/* Mode Tag */}
            <span className="hidden lg:inline-block text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-white/[0.08] px-2 py-0.5 rounded">
              STATEFUL_VAULT
            </span>

            {/* Docs link */}
            <Link
              href="/docs"
              className="hidden sm:flex text-xs font-mono text-zinc-400 hover:text-white transition items-center space-x-1"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Docs</span>
            </Link>

            {/* Author Attribution */}
            <a
              href="https://saadkhalidhere.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center space-x-1.5 pl-2 border-l border-white/[0.08] text-xs font-mono text-zinc-400 hover:text-emerald-400 transition"
              title="Saad Khalid (Lead Architect)"
            >
              <span className="h-5 w-5 rounded-full bg-zinc-800 border border-white/[0.1] text-[10px] font-semibold text-zinc-300 flex items-center justify-center">
                SK
              </span>
            </a>

            {/* Mobile Menu Button (< md) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden touch-target rounded-lg text-zinc-300 hover:text-white bg-zinc-900/90 border border-white/[0.1] active-spring flex items-center justify-center"
              aria-label={mobileMenuOpen ? "Close console navigation" : "Open console navigation"}
            >
              <span className="text-xs font-mono text-zinc-400 font-semibold px-2">Menu</span>
            </button>
          </div>
        </div>

        {/* Bottom Navigation Tabs Bar (Horizontally scrollable with smooth touch) */}
        <nav
          className="flex items-center space-x-1 py-2 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0"
          aria-label="Console Navigation Tabs"
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`touch-target flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-sans transition shrink-0 active-spring ${
                  isActive
                    ? "bg-zinc-850 text-white font-medium shadow-sm border border-white/[0.1]"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-emerald-400" : "text-zinc-500"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 2026 Mobile Drawer for Console */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-24 bottom-0 bg-[#050506]/98 backdrop-blur-2xl border-b border-white/[0.08] p-5 overflow-y-auto flex flex-col justify-between space-y-6 animate-enter-down z-50">
          <div className="space-y-4">
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-2 font-semibold">
              Console Navigation
            </div>

            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 p-3 rounded-xl text-sm font-medium transition ${
                      isActive
                        ? "bg-zinc-800 text-white border border-white/[0.1]"
                        : "hover:bg-white/[0.04] text-zinc-300"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? "text-emerald-400" : "text-zinc-400"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 border-t border-white/[0.08] space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-2 font-semibold">
                Platform Resources
              </div>
              <Link
                href="/docs"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/[0.04] text-zinc-300 text-sm font-medium transition"
              >
                <BookOpen className="h-4 w-4 text-amber-400" />
                <span>Technical Documentation</span>
              </Link>
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/[0.04] text-zinc-300 text-sm font-medium transition"
              >
                <ArrowLeft className="h-4 w-4 text-cyan-400" />
                <span>Product Landing Page</span>
              </Link>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-white/[0.08]">
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <a
                href="https://github.com/enabled404/hera"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-1.5 p-2.5 rounded-xl bg-zinc-900 border border-white/[0.06] text-zinc-300 hover:text-white"
              >
                <Github className="h-3.5 w-3.5" />
                <span>GitHub</span>
              </a>

              <a
                href="https://saadkhalidhere.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-1 p-2.5 rounded-xl bg-zinc-900 border border-white/[0.06] text-zinc-300 hover:text-emerald-400"
              >
                <span>Saad Khalid</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
