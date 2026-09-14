import "./globals.css";
import React from "react";

export const metadata = {
  title: "Hera StateGuard — Zero-Trust State Security for Autonomous AI Agents",
  description:
    "Cryptographic state vaulting, Merkle DAG lineage verification, and in-flight streaming secret redaction for frontier reasoning LLMs (arXiv:2608.09867).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#050506] text-zinc-100 antialiased flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-200">
        {children}
      </body>
    </html>
  );
}
