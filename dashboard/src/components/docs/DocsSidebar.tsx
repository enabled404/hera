"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Command,
  X,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  badge?: string;
  description?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const DOC_SECTIONS: NavSection[] = [
  {
    title: "Getting Started",
    items: [
      {
        title: "Overview & Quickstart",
        href: "/docs",
        badge: "v1.1",
        description: "Docker Compose, native binary installation, and proxy routing.",
      },
    ],
  },
  {
    title: "Core Architecture",
    items: [
      {
        title: "System Architecture & Invariants",
        href: "/docs/architecture",
        description: "P1 Ordinality, P2 Isolation, P4 Telemetry, and Associated Data formulas.",
      },
      {
        title: "Threat Model (arXiv:2608.09867)",
        href: "/docs/threat-model",
        badge: "Critical",
        description: "Decryption Oracles, the Sanitization Trap, and CVSS 8.6 advisory.",
      },
    ],
  },
  {
    title: "Deployment & Operations",
    items: [
      {
        title: "Reverse Proxy Deployment",
        href: "/docs/proxy-deployment",
        description: "stateguard-proxy Docker setup, Redis caching, and environment variables.",
      },
      {
        title: "Static CLI Scanner & SARIF",
        href: "/docs/cli-scanner",
        description: "Offline trajectory auditing, GitHub Code Scanning, and batch migration.",
      },
    ],
  },
  {
    title: "SDK & Framework Hooks",
    items: [
      {
        title: "SDK Reference (Py & TS)",
        href: "/docs/sdk-reference",
        description: "Python OpenTelemetry span processor, LangChain, and Vercel AI SDK hooks.",
      },
    ],
  },
];

export default function DocsSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [filter, setFilter] = useState("");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const allItems = DOC_SECTIONS.flatMap((s) => s.items);
  const searchResults = allItems.filter(
    (item) =>
      item.title.toLowerCase().includes(filter.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(filter.toLowerCase()))
  );

  const filteredSections = DOC_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) =>
      item.title.toLowerCase().includes(filter.toLowerCase())
    ),
  })).filter((section) => section.items.length > 0);

  return (
    <>
      <aside className="w-full lg:w-64 shrink-0 space-y-6 lg:border-r border-white/[0.08] lg:pr-6 lg:py-6">
        {/* Search Trigger Button with Cmd+K Badge */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between pl-3 pr-2 py-1.5 rounded-lg bg-black/60 hover:bg-zinc-900 border border-white/[0.08] text-xs font-mono text-zinc-400 hover:text-white transition group"
        >
          <div className="flex items-center space-x-2">
            <Search className="h-3.5 w-3.5 text-zinc-500 group-hover:text-emerald-400 transition" />
            <span>Search docs...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-zinc-800 border border-white/[0.08] text-[10px] text-zinc-400">
            <Command className="h-2.5 w-2.5" />
            <span>K</span>
          </kbd>
        </button>

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
                            ? "bg-zinc-850 font-medium text-white border-l-2 border-l-emerald-400 pl-2.5 shadow-sm"
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

      {/* Floating Command Palette (Cmd+K) Modal */}
      {commandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-md animate-enter-down">
          <div className="relative w-full max-w-lg rounded-2xl glass-panel border border-white/[0.12] p-4 shadow-2xl space-y-4">
            {/* Search Input Bar */}
            <div className="flex items-center space-x-3 pb-3 border-b border-white/[0.08]">
              <Search className="h-4 w-4 text-emerald-400" />
              <input
                type="text"
                autoFocus
                placeholder="Type a topic, invariant, or keyword to search..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full bg-transparent text-sm font-sans text-white placeholder-zinc-500 focus:outline-none"
              />
              <button
                onClick={() => setCommandPaletteOpen(false)}
                className="p-1 rounded text-zinc-500 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-72 overflow-y-auto space-y-1">
              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs font-mono text-zinc-500">
                  No matching documentation articles found.
                </div>
              ) : (
                searchResults.map((item) => (
                  <div
                    key={item.href}
                    onClick={() => {
                      setCommandPaletteOpen(false);
                      router.push(item.href);
                    }}
                    className="p-2.5 rounded-xl hover:bg-white/[0.06] cursor-pointer transition flex items-start justify-between space-x-3 group"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-xs font-semibold text-white group-hover:text-emerald-300 transition flex items-center space-x-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-zinc-400 group-hover:text-emerald-400" />
                        <span className="truncate">{item.title}</span>
                      </div>
                      {item.description && (
                        <p className="text-[11px] text-zinc-400 font-sans line-clamp-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-emerald-400 shrink-0 mt-1" />
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-zinc-500">
              <span>Press <kbd className="text-zinc-400">Esc</kbd> to close</span>
              <span>Project Hera &bull; StateGuard v1.1</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
