"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  List,
  ExternalLink,
  Shield,
  Github,
  ArrowRight,
  Terminal,
  FileText,
  AlertTriangle,
} from "lucide-react";

interface TOCItem {
  id: string;
  title: string;
}

const TOC_MAP: Record<string, TOCItem[]> = {
  "/docs": [
    { id: "what-hera-solves", title: "What Hera Solves" },
    { id: "docker-quickstart", title: "1. Docker Compose Quickstart" },
    { id: "cli-scanner-quickstart", title: "2. Zero-Install CLI Scanner" },
    { id: "sdk-route-quickstart", title: "3. Route Requests via Hera" },
  ],
  "/docs/architecture": [
    { id: "core-invariants", title: "Core Security Invariants (P1, P2, P4)" },
    { id: "ad-tuple", title: "Associated Data (AD) Context Tuple" },
    { id: "sequence-ratchet", title: "DAG Sequence Ratcheting" },
    { id: "performance-budget", title: "Zero-Copy SIMD Performance" },
  ],
  "/docs/threat-model": [
    { id: "threat-taxonomy", title: "Threat Taxonomy (arXiv:2608.09867)" },
    { id: "vector-oracle", title: "Vector 1: Decryption Oracles" },
    { id: "vector-trap", title: "Vector 2: Sanitization Trap" },
    { id: "vector-replay", title: "Vector 3: Cross-User Replay" },
    { id: "cvss-score", title: "CVSS 8.6 Critical Impact" },
  ],
  "/docs/proxy-deployment": [
    { id: "topologies", title: "Deployment Topologies" },
    { id: "docker-config", title: "stateguard-proxy Configuration" },
    { id: "redis-vault", title: "Redis Ephemeral RAM Vault" },
    { id: "env-reference", title: "Environment Variables Reference" },
  ],
  "/docs/cli-scanner": [
    { id: "scanner-overview", title: "Static Scanner Capabilities" },
    { id: "ci-cd-sarif", title: "GitHub Actions & SARIF Gate" },
    { id: "migrate-command", title: "stateguard migrate Command" },
    { id: "exit-codes", title: "CLI Flags & Exit Codes" },
  ],
  "/docs/sdk-reference": [
    { id: "otel-processor", title: "OpenTelemetry Span Processor" },
    { id: "langchain-hooks", title: "LangChain & LlamaIndex Hooks" },
    { id: "vercel-ai-sdk", title: "Vercel AI SDK Integration" },
    { id: "crypto-primitives", title: "Direct Cryptographic Helpers" },
  ],
};

export default function DocsTOC() {
  const pathname = usePathname();
  const [activeId, setActiveId] = useState<string>("");

  const items = TOC_MAP[pathname] || TOC_MAP["/docs"];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;
      for (let i = items.length - 1; i >= 0; i--) {
        const el = document.getElementById(items[i].id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveId(items[i].id);
          return;
        }
      }
      if (items.length > 0 && window.scrollY < 200) {
        setActiveId(items[0].id);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [items, pathname]);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveId(id);
      window.history.pushState(null, "", `#${id}`);
    }
  };

  return (
    <aside className="hidden xl:block w-64 shrink-0 space-y-6 py-6 pl-6 border-l border-white/[0.08]">
      {/* On This Page Nav */}
      <div className="space-y-3">
        <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-400 flex items-center space-x-1.5">
          <List className="h-3.5 w-3.5 text-zinc-400" />
          <span>On this page</span>
        </div>

        <ul className="space-y-1 text-xs">
          {items.map((item) => {
            const isActive = activeId === item.id;
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => scrollToSection(e, item.id)}
                  className={`block py-1 px-2 rounded-md transition-all font-sans leading-snug ${
                    isActive
                      ? "text-white font-medium bg-zinc-900 border-l-2 border-emerald-400 pl-2.5"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]"
                  }`}
                >
                  {item.title}
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Quick Community / Resource Links */}
      <div className="pt-4 border-t border-white/[0.06] space-y-3">
        <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
          Resources
        </div>

        <div className="space-y-1.5 text-xs font-mono">
          <a
            href="https://github.com/enabled404/hera"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/60 border border-white/[0.06] text-zinc-400 hover:text-white hover:border-white/[0.12] transition group"
          >
            <span className="flex items-center space-x-2">
              <Github className="h-3.5 w-3.5 text-zinc-400 group-hover:text-white" />
              <span>GitHub Repo</span>
            </span>
            <ExternalLink className="h-3 w-3 text-zinc-500" />
          </a>

          <Link
            href="/dashboard"
            className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 hover:text-emerald-300 hover:border-emerald-500/40 transition group"
          >
            <span className="flex items-center space-x-2">
              <Shield className="h-3.5 w-3.5 text-emerald-400" />
              <span>SOC Sandbox</span>
            </span>
            <ArrowRight className="h-3 w-3 text-emerald-400 group-hover:translate-x-0.5 transition" />
          </Link>

          <a
            href="https://saadkhalidhere.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/60 border border-white/[0.06] text-zinc-400 hover:text-white hover:border-white/[0.12] transition group"
          >
            <span className="truncate">Saad Khalid</span>
            <ExternalLink className="h-3 w-3 text-zinc-500" />
          </a>
        </div>
      </div>

      {/* Security Advisory Badge */}
      <div className="p-3 rounded-lg bg-zinc-900/60 border border-white/[0.06] space-y-1.5">
        <div className="flex items-center space-x-1.5 text-[10px] font-mono text-amber-400 font-semibold">
          <AlertTriangle className="h-3 w-3" />
          <span>arXiv:2608.09867</span>
        </div>
        <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
          StateGuard cryptographic bounds protect against CVE-grade reasoning trace transplantation.
        </p>
      </div>
    </aside>
  );
}
