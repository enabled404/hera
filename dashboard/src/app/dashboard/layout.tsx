"use client";

import React from "react";
import ConsoleNavbar from "@/components/dashboard/ConsoleNavbar";
import Link from "next/link";
import { Shield, ExternalLink } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#050506] text-zinc-100 flex flex-col font-sans">
      <ConsoleNavbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      <footer className="border-t border-white/[0.06] bg-[#050506]/90 backdrop-blur py-5 text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-zinc-400 font-medium font-sans">HERA / STATEGUARD</span>
            <span className="text-zinc-700">|</span>
            <span className="text-zinc-500">Autonomous Agent Cryptographic Gateway</span>
          </div>
          <div className="flex items-center space-x-4 text-zinc-400">
            <a
              href="https://github.com/enabled404/hera"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition"
            >
              GitHub
            </a>
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
            <span className="text-zinc-700">&bull;</span>
            <span className="text-zinc-600">v1.1 Enterprise</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
