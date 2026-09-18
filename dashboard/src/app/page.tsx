"use client";

import React from "react";
import LandingNavbar from "@/components/landing/LandingNavbar";
import HeroSection from "@/components/landing/HeroSection";
import ExploitVisualizer from "@/components/landing/ExploitVisualizer";
import ThreatMatrix from "@/components/landing/ThreatMatrix";
import ArchitecturePillars from "@/components/landing/ArchitecturePillars";
import BenchmarkGrid from "@/components/landing/BenchmarkGrid";
import CliTerminal from "@/components/landing/CliTerminal";
import LandingFooter from "@/components/landing/LandingFooter";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "Hera",
      "alternateName": "Hera StateGuard",
      "applicationCategory": "SecuritySoftware",
      "operatingSystem": "Linux, macOS, Windows, Docker",
      "softwareVersion": "1.1.0",
      "description":
        "Enterprise zero-trust state security gateway and reasoning trace auditor mitigating Cryptographic Contextual Misbinding (arXiv:2608.09867) in frontier LLMs.",
      "url": "https://herasec.vercel.app",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
      },
      "author": {
        "@type": "Person",
        "name": "Saad Khalid",
        "url": "https://saadkhalidhere.vercel.app",
      },
    },
    {
      "@type": "TechArticle",
      "headline":
        "Mitigating Cryptographic Contextual Misbinding in Frontier LLM Reasoning Models",
      "identifier": "SG-ADV-2026-001",
      "citation": "https://arxiv.org/abs/2608.09867",
      "author": {
        "@type": "Person",
        "name": "Saad Khalid",
        "url": "https://saadkhalidhere.vercel.app",
      },
      "publisher": {
        "@type": "Organization",
        "name": "Hera Security",
        "url": "https://herasec.vercel.app",
      },
    },
    {
      "@type": "Organization",
      "name": "Hera Security",
      "url": "https://herasec.vercel.app",
      "founder": {
        "@type": "Person",
        "name": "Saad Khalid",
        "url": "https://saadkhalidhere.vercel.app",
      },
    },
  ],
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050506] text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-200">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingNavbar />
      <main className="flex-1 w-full">
        <HeroSection />
        <ExploitVisualizer />
        <ThreatMatrix />
        <ArchitecturePillars />
        <BenchmarkGrid />
        <CliTerminal />
      </main>
      <LandingFooter />
    </div>
  );
}
