import "./globals.css";
import React from "react";
import Link from "next/link";

export const metadata = {
  title: "StateGuard - Enterprise Agent State Security Gateway",
  description: "Cryptographic state vaulting and trace auditing platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#070a12] text-slate-100 antialiased flex flex-col">
        <header className="border-b border-slate-800/80 bg-[#0c101c]/90 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
                  SG
                </div>
                <div className="flex flex-col">
                  <span className="font-bold tracking-tight text-lg leading-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                    STATEGUARD
                  </span>
                  <span className="text-[10px] text-indigo-400 font-mono tracking-widest uppercase">
                    HERA PLATFORM
                  </span>
                </div>
              </Link>
              <nav className="hidden md:flex space-x-1">
                <Link
                  href="/"
                  className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-200 hover:text-white hover:bg-slate-800/60 transition"
                >
                  Live Threat Feed
                </Link>
                <Link
                  href="/sessions"
                  className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
                >
                  Session & Merkle Audit
                </Link>
                <Link
                  href="/settings"
                  className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition"
                >
                  Gateway Policy
                </Link>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>GATEWAY ACTIVE (p99: 1.2ms)</span>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 text-xs font-mono">
                MODE: STATEFUL_VAULT
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        <footer className="border-t border-slate-900 bg-[#05070d] py-6 text-center text-xs text-slate-500 font-mono">
          StateGuard Enterprise Gateway & Trace Auditing Platform &bull; Autonomous Agent Security
        </footer>
      </body>
    </html>
  );
}
