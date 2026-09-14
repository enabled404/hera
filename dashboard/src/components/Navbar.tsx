"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  Activity,
  Layers,
  Terminal,
  Sliders,
  ExternalLink,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Live Stream", icon: Activity },
    { href: "/sessions", label: "Session DAG", icon: Layers },
    { href: "/playground", label: "Trace Sanitizer", icon: Terminal },
    { href: "/settings", label: "Policy", icon: Sliders },
  ];

  return (
    <header className="sticky top-0 z-50 w-full h-14 border-b border-white/[0.07] bg-[#050506]/85 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Group: Identity */}
        <div className="flex items-center space-x-3">
          <Link href="/" className="group flex items-center space-x-2.5">
            <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 border border-white/[0.1] shadow-inner">
              <Shield className="h-3.5 w-3.5 text-zinc-300 transition group-hover:text-white" />
              <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-bold tracking-tight text-white text-sm font-sans">
                HERA
              </span>
              <span className="text-zinc-600 text-xs">|</span>
              <span className="text-zinc-400 font-medium text-xs font-sans">
                StateGuard
              </span>
            </div>
          </Link>

          <span className="text-[11px] font-mono text-zinc-400 bg-zinc-800/60 px-2 py-0.5 rounded-full border border-white/[0.06]">
            v1.1
          </span>
        </div>

        {/* Center Group: Floating Segmented Navigation */}
        <nav className="hidden md:flex items-center bg-zinc-900/90 border border-white/[0.08] p-1 rounded-full shadow-inner space-x-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center space-x-1.5 px-3.5 py-1 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? "bg-zinc-800 text-white shadow-sm border border-white/[0.08]"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Icon className={`h-3 w-3 ${isActive ? "text-emerald-400" : "text-zinc-500"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Group: Telemetry Status, GitHub & Profile */}
        <div className="flex items-center space-x-2.5">
          {/* Status Badge */}
          <div className="flex items-center space-x-2 rounded-full bg-zinc-900/80 border border-white/[0.08] px-3 py-1 text-xs font-mono text-zinc-300 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-zinc-400 text-[11px]">
              Gateway Active <span className="text-zinc-600">&middot;</span>{" "}
              <span className="text-emerald-400 font-medium tabular-nums">0.49ms p99</span>
            </span>
          </div>

          {/* GitHub Icon Button */}
          <a
            href="https://github.com/enabled404/hera"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.08] text-zinc-400 hover:text-white transition"
            title="GitHub Repository"
          >
            <svg
              className="h-3.5 w-3.5 fill-current"
              viewBox="0 0 24 24"
            >
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>

          {/* Author Profile Badge */}
          <a
            href="https://saadkhalidhere.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.08] px-2.5 py-1 text-xs text-zinc-300 hover:text-white transition group"
            title="Lead Architect Portfolio"
          >
            <span className="h-4 w-4 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 flex items-center justify-center text-[9px] font-bold text-white">
              SK
            </span>
            <span className="hidden sm:inline text-xs font-sans text-zinc-400 group-hover:text-zinc-200">
              Saad Khalid
            </span>
            <ExternalLink className="h-2.5 w-2.5 text-zinc-600 group-hover:text-zinc-400" />
          </a>
        </div>
      </div>
    </header>
  );
}

