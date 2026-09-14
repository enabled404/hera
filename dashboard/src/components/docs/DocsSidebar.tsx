"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Shield,
  Layers,
  Terminal,
  Cpu,
  Zap,
  Search,
  ArrowRight,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const DOC_SECTIONS: NavSection[] = [
  {
    title: "Getting Started",
    items: [
      { title: "Overview & Quickstart", href: "/docs", badge: "v1.1" },
    ],
  },
  {
    title: "Core Architecture",
    items: [
      { title: "System Architecture & Invariants", href: "/docs/architecture" },
      { title: "Threat Model (arXiv:2608.09867)", href: "/docs/threat-model", badge: "Critical" },
    ],
  },
  {
    title: "Deployment & Operations",
    items: [
      { title: "Reverse Proxy Deployment", href: "/docs/proxy-deployment" },
      { title: "Static CLI Scanner & SARIF", href: "/docs/cli-scanner" },
    ],
  },
  {
    title: "SDK & Framework Hooks",
    items: [
      { title: "SDK Reference (Py & TS)", href: "/docs/sdk-reference" },
    ],
  },
];

export default function DocsSidebar() {
  const pathname = usePathname();
  const [filter, setFilter] = useState("");

  const filteredSections = DOC_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) =>
      item.title.toLowerCase().includes(filter.toLowerCase())
    ),
  })).filter((section) => section.items.length > 0);

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-6 lg:border-r border-white/[0.08] lg:pr-6 lg:py-6">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
        <input
          type="text"
          placeholder="Filter documentation..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-black/60 border border-white/[0.08] text-xs font-mono text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition"
        />
      </div>

      {/* Navigation Sections */}
      <nav className="space-y-6">
        {filteredSections.map((section, idx) => (
          <div key={idx} className="space-y-2">
            <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-400 px-2">
              {section.title}
            </div>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-sans transition ${
                        isActive
                          ? "bg-zinc-850 font-medium text-white border-l-2 border-l-emerald-400 pl-2.5"
                          : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      <span className="truncate">{item.title}</span>
                      {item.badge && (
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded ml-1.5 shrink-0 ${
                            item.badge === "Critical"
                              ? "bg-rose-950/60 text-rose-300 border border-rose-500/30"
                              : "bg-zinc-800 text-zinc-300 border border-white/[0.06]"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Sandbox Promotion Widget */}
      <div className="p-3.5 rounded-xl bg-gradient-to-b from-zinc-900/90 to-black border border-white/[0.08] space-y-2">
        <div className="text-xs font-semibold text-white font-sans flex items-center space-x-1.5">
          <Shield className="h-3.5 w-3.5 text-emerald-400" />
          <span>Interactive Sandbox</span>
        </div>
        <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
          Test real-time attacks against the live gateway without local setup.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center space-x-1 text-xs font-mono text-emerald-400 hover:text-emerald-300 transition"
        >
          <span>Open Live SOC Console</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </aside>
  );
}
