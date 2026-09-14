"use client";

import React from "react";
import Link from "next/link";
import { Shield, ArrowRight, Github, ExternalLink, ArrowLeft } from "lucide-react";
import DocsSidebar from "@/components/docs/DocsSidebar";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050506] text-zinc-100 flex flex-col font-sans">
      {/* Docs Header */}
      <header className="sticky top-0 z-40 w-full bg-[#050506]/90 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-zinc-900 border border-white/[0.1] group-hover:border-emerald-500/40 transition">
                <Shield className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-sm text-white">HERA</span>
                <span className="text-zinc-600 font-mono">/</span>
                <span className="text-xs font-mono text-zinc-400">DOCS</span>
              </div>
            </Link>

            <Link
              href="/"
              className="hidden sm:inline-flex items-center space-x-1 text-xs font-mono text-zinc-400 hover:text-white transition"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Product Home</span>
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            <a
              href="https://github.com/enabled404/hera"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center space-x-1.5 text-xs font-mono text-zinc-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-white/[0.06] hover:bg-zinc-900 transition"
            >
              <Github className="h-3.5 w-3.5" />
              <span>GitHub</span>
            </a>

            <Link
              href="/dashboard"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-medium font-sans shadow-sm transition"
            >
              <span>Live SOC Sandbox</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Body with Sidebar */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-8">
        <DocsSidebar />
        <main className="flex-1 min-w-0 max-w-4xl py-2">{children}</main>
      </div>

      {/* Minimal Docs Footer */}
      <footer className="border-t border-white/[0.06] bg-[#050506] py-6 text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Hera StateGuard Documentation · v1.1.0 Enterprise</span>
          <div className="flex items-center space-x-3">
            <a
              href="https://saadkhalidhere.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition flex items-center space-x-1"
            >
              <span>Saad Khalid (Lead Architect)</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
