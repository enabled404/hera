import "./globals.css";
import React from "react";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Hera StateGuard — Enterprise AI State Vault & SOC Gateway",
  description: "Cryptographic state vaulting, Merkle DAG lineage verification, and trace auditing platform for autonomous LLM agents.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#050507] text-slate-100 antialiased flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-200">
        <Navbar />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        <footer className="border-t border-white/[0.06] bg-[#030305]/80 backdrop-blur py-6 text-xs text-slate-500 font-mono">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400"></span>
              <span className="text-slate-400 font-medium font-sans">HERA / STATEGUARD v1.1.0</span>
              <span className="text-slate-700">|</span>
              <span className="text-slate-500">Autonomous Agent Cryptographic Gateway</span>
            </div>
            <div className="flex items-center space-x-4 text-slate-400">
              <a
                href="https://github.com/enabled404/hera"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition"
              >
                GitHub
              </a>
              <span className="text-slate-700">&bull;</span>
              <a
                href="https://saadkhalidhere.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-cyan-400 transition"
              >
                Saad Khalid (Architect)
              </a>
              <span className="text-slate-700">&bull;</span>
              <span className="text-slate-600">Zero-Trust SOC</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

