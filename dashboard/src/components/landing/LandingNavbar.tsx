"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Github, ArrowRight, Menu, X, ExternalLink } from "lucide-react";
import HeraLogo from "@/components/ui/HeraLogo";

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        scrolled
          ? "bg-[#050506]/90 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.6)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Geometric Hera Brand Mark */}
        <Link href="/" className="flex items-center space-x-3 group">
          <HeraLogo size={32} glow />
          <div className="flex items-center space-x-2">
            <span className="text-base font-bold tracking-tight text-white font-sans">HERA</span>
            <span className="text-zinc-600 font-mono text-sm">|</span>
            <span className="text-xs font-mono text-zinc-400 tracking-wide font-medium hidden sm:inline">
              StateGuard v1.1
            </span>
          </div>
        </Link>

        {/* Center: Navigation Anchors */}
        <nav className="hidden md:flex items-center space-x-1 p-1 rounded-full bg-zinc-900/60 border border-white/[0.06] backdrop-blur-md text-xs font-medium text-zinc-400">
          <a
            href="#threat-model"
            className="px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/[0.04] transition"
          >
            Threat Model
          </a>
          <a
            href="#exploit-visualizer"
            className="px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/[0.04] transition"
          >
            Exploit Demo
          </a>
          <a
            href="#architecture"
            className="px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/[0.04] transition"
          >
            Architecture
          </a>
          <a
            href="#benchmarks"
            className="px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/[0.04] transition"
          >
            Benchmarks
          </a>
          <Link
            href="/docs"
            className="px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/[0.04] transition"
          >
            Documentation
          </Link>
        </nav>

        {/* Right: Actions & Sandbox CTA */}
        <div className="hidden lg:flex items-center space-x-3">
          {/* GitHub Repo Link */}
          <a
            href="https://github.com/enabled404/hera"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono text-zinc-400 hover:text-white hover:bg-zinc-900 border border-white/[0.06] transition"
          >
            <Github className="h-3.5 w-3.5" />
            <span>enabled404/hera</span>
          </a>

          {/* Author attribution link */}
          <a
            href="https://saadkhalidhere.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-zinc-400 hover:text-emerald-400 transition flex items-center space-x-1 px-2 py-1"
          >
            <span>by Saad Khalid</span>
            <ExternalLink className="h-3 w-3 text-zinc-500" />
          </a>

          {/* Primary CTA */}
          <Link
            href="/dashboard"
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-medium font-sans shadow-[0_0_16px_rgba(16,185,129,0.25)] transition duration-150 active:scale-[0.98]"
          >
            <span>Launch Live Sandbox</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center space-x-2">
          <Link
            href="/dashboard"
            className="px-2.5 py-1 rounded bg-emerald-500 text-black text-xs font-medium"
          >
            Sandbox
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-zinc-900 border border-white/[0.08]"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0c0c0e] border-b border-white/[0.08] px-4 py-4 space-y-3">
          <a
            href="#threat-model"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-zinc-300 hover:text-white py-1"
          >
            Threat Model
          </a>
          <a
            href="#exploit-visualizer"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-zinc-300 hover:text-white py-1"
          >
            Exploit Demo
          </a>
          <a
            href="#architecture"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-zinc-300 hover:text-white py-1"
          >
            Architecture
          </a>
          <a
            href="#benchmarks"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-zinc-300 hover:text-white py-1"
          >
            Benchmarks
          </a>
          <Link
            href="/docs"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm text-zinc-300 hover:text-white py-1"
          >
            Technical Documentation
          </Link>
          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
            <a
              href="https://github.com/enabled404/hera"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-zinc-400 hover:text-white flex items-center space-x-1"
            >
              <Github className="h-3.5 w-3.5" />
              <span>GitHub</span>
            </a>
            <a
              href="https://saadkhalidhere.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-zinc-400 hover:text-emerald-400"
            >
              Saad Khalid Portfolio &rarr;
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
