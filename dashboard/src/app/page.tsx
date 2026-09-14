"use client";

import React from "react";
import LandingNavbar from "@/components/landing/LandingNavbar";
import HeroSection from "@/components/landing/HeroSection";
import ExploitVisualizer from "@/components/landing/ExploitVisualizer";
import ThreatMatrix from "@/components/landing/ThreatMatrix";
import ArchitecturePillars from "@/components/landing/ArchitecturePillars";
import BenchmarkGrid from "@/components/landing/BenchmarkGrid";
import LandingFooter from "@/components/landing/LandingFooter";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050506] text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-200">
      <LandingNavbar />
      <main className="flex-1 w-full">
        <HeroSection />
        <ExploitVisualizer />
        <ThreatMatrix />
        <ArchitecturePillars />
        <BenchmarkGrid />
      </main>
      <LandingFooter />
    </div>
  );
}
