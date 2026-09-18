"use client";

import React from "react";
import Link from "next/link";
import { Github, ExternalLink, Heart, Terminal } from "lucide-react";
import HeraLogo from "@/components/ui/HeraLogo";

export default function LandingFooter() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#050506] text-xs font-mono text-zinc-500 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Platform Overview */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2.5">
              <HeraLogo size={24} glow />
              <span className="text-sm font-bold text-white font-sans">HERA · STATEGUARD</span>
              <span className="text-zinc-600">|</span>
              <span className="text-xs text-zinc-400">v1.1.0 Enterprise</span>
            </div>
            <p className="text-xs text-zinc-400 max-w-sm font-sans leading-relaxed">
              Cryptographic state vaulting, Merkle DAG lineage verification, and in-flight streaming
              redaction for autonomous LLM reasoning agents.
            </p>
            <div className="text-[11px] text-zinc-500 pt-1">
              Apache-2.0 Licensed · Pure Memory-Safe Rust Core
            </div>
          </div>

          {/* Col 2: Documentation & Links */}
          <div className="space-y-2.5">
            <div className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Documentation
            </div>
            <ul className="space-y-1.5 text-zinc-400">
              <li>
                <Link href="/docs" className="hover:text-white transition">
                  Overview &amp; Quickstart
                </Link>
              </li>
              <li>
                <Link href="/docs/architecture" className="hover:text-white transition">
                  Cryptographic Invariants
                </Link>
              </li>
              <li>
                <Link href="/docs/threat-model" className="hover:text-white transition">
                  Threat Model (arXiv:2608)
                </Link>
              </li>
              <li>
                <Link href="/docs/proxy-deployment" className="hover:text-white transition">
                  Proxy Deployment
                </Link>
              </li>
              <li>
                <Link href="/docs/sdk-reference" className="hover:text-white transition">
                  SDK Reference
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Interactive Sandbox & Community */}
          <div className="space-y-2.5">
            <div className="text-xs font-semibold text-white uppercase tracking-wider font-mono">
              Live Console
            </div>
            <ul className="space-y-1.5 text-zinc-400">
              <li>
                <Link href="/dashboard" className="hover:text-emerald-400 transition flex items-center space-x-1">
                  <span>Live Threat Stream</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard/sessions" className="hover:text-white transition">
                  Session DAG Explorer
                </Link>
              </li>
              <li>
                <Link href="/dashboard/playground" className="hover:text-white transition">
                  Trace Sanitizer Lab
                </Link>
              </li>
              <li>
                <Link href="/dashboard/settings" className="hover:text-white transition">
                  Policy &amp; Cipher Config
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/enabled404/hera"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition flex items-center space-x-1"
                >
                  <Github className="h-3 w-3" />
                  <span>GitHub Repository</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Attribution Line */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <div className="flex items-center space-x-2 text-zinc-400">
            <span>Architected &amp; Engineered by</span>
            <a
              href="https://saadkhalidhere.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-emerald-400 font-medium transition inline-flex items-center space-x-1"
            >
              <span>Saad Khalid</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <span className="text-zinc-600">·</span>
            <a
              href="https://threads.net/@saadkhalidhere"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 hover:text-white transition"
            >
              @saadkhalidhere
            </a>
          </div>

          <div className="text-zinc-500">
            &copy; {new Date().getFullYear()} Project Hera · All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
