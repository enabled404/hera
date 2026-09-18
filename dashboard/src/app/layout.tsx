import "./globals.css";
import React from "react";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://herasec.vercel.app"),
  title: {
    default: "Hera | Zero-Trust State Gateway & Reasoning Trace Auditor for AI Agents",
    template: "%s | Hera – Zero-Trust AI State Security Gateway",
  },
  description:
    "Enterprise security gateway mitigating Cryptographic Contextual Misbinding (arXiv:2608.09867) in frontier LLMs. Neutralize decryption oracles, prevent secret trapping in CoT reasoning, and enforce zero-trust state isolation.",
  keywords: [
    "AI security gateway",
    "reasoning trace audit",
    "LLM state security",
    "chain of thought leakage",
    "prompt injection defense",
    "agentic AI security",
    "arXiv:2608.09867",
    "Anthropic thinking signature",
    "OpenAI encrypted reasoning",
    "StateGuard",
    "zero-trust AI",
    "Saad Khalid",
  ],
  authors: [{ name: "Saad Khalid", url: "https://saadkhalidhere.vercel.app" }],
  creator: "Saad Khalid",
  publisher: "Saad Khalid",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://herasec.vercel.app",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://herasec.vercel.app",
    siteName: "Hera StateGuard",
    title: "Hera | Zero-Trust State Gateway & Reasoning Trace Auditor for AI Agents",
    description:
      "Enterprise security gateway mitigating Cryptographic Contextual Misbinding (arXiv:2608.09867) in frontier LLMs. Sub-0.49ms zero-trust state verification.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Hera Zero-Trust AI State Security Gateway",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hera | Zero-Trust AI State Security Gateway",
    description:
      "Mitigate Cryptographic Contextual Misbinding (arXiv:2608.09867) with sub-0.49ms zero-trust verification for frontier LLMs.",
    creator: "@saadkhalidhere",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon",
  },
};

export const viewport: Viewport = {
  themeColor: "#10b981",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
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
