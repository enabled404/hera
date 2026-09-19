"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Github, ExternalLink, ArrowLeft, Scale } from "lucide-react";
import DocsSidebar from "@/components/docs/DocsSidebar";
import DocsTOC from "@/components/docs/DocsTOC";
import HeraLogo from "@/components/ui/HeraLogo";
import ResponsibleUseModal from "@/components/ui/ResponsibleUseModal";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#050506] text-zinc-100 flex flex-col font-sans">
      {/* Docs Header */}
      <header className="sticky top-0 z-40 w-full bg-[#050506]/90 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <HeraLogo size={28} glow />
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

      {/* Main Body with 3-Column Layout: Left Nav / Center Content / Right TOC */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-8">
        <DocsSidebar />
        <main className="flex-1 min-w-0 max-w-3xl py-2">{children}</main>
        <DocsTOC />
      </div>

      {/* Minimal Docs Footer */}
      <footer className="border-t border-white/[0.06] bg-[#050506] py-6 text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span>Hera StateGuard Documentation &middot; v1.1.0 Enterprise</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsTermsOpen(true)}
              className="hover:text-zinc-300 transition flex items-center space-x-1"
            >
              <Scale className="h-3 w-3 text-zinc-500" />
              <span>Responsible Use &amp; Terms</span>
            </button>
            <span className="text-zinc-700">&bull;</span>
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

      {/* Responsible Use Modal */}
      <ResponsibleUseModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
    </div>
  );
}
