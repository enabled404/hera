"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Github,
  ArrowRight,
  Menu,
  X,
  ExternalLink,
  Shield,
  Terminal,
  Layers,
  Activity,
  BookOpen,
  Cpu,
} from "lucide-react";
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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        scrolled || mobileMenuOpen
          ? "bg-[#050506]/95 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.6)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Geometric Hera Brand Mark */}
        <Link
          href="/"
          className="flex items-center space-x-3 group touch-target"
          aria-label="Hera Home"
          onClick={() => setMobileMenuOpen(false)}
        >
          <HeraLogo size={32} glow />
          <div className="flex items-center space-x-2">
            <span className="text-base font-bold tracking-tight text-white font-sans">HERA</span>
            <span className="text-zinc-600 font-mono text-sm">|</span>
            <span className="text-xs font-mono text-zinc-400 tracking-wide font-medium hidden sm:inline">
              StateGuard v1.1
            </span>
          </div>
        </Link>

        {/* Center: Navigation Anchors (Desktop) */}
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

        {/* Right: Actions & Sandbox CTA (Desktop) */}
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
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-medium font-sans shadow-[0_0_16px_rgba(16,185,129,0.25)] transition duration-150 active-spring btn-shine"
          >
            <span>Launch Live Sandbox</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Mobile menu triggers (< md) */}
        <div className="md:hidden flex items-center space-x-2">
          <Link
            href="/dashboard"
            className="touch-target px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-semibold font-sans active-spring"
          >
            Sandbox
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="touch-target rounded-xl text-zinc-300 hover:text-white bg-zinc-900/90 border border-white/[0.1] active-spring"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {mobileMenuOpen ? <X className="h-5 w-5 text-zinc-200" /> : <Menu className="h-5 w-5 text-zinc-200" />}
          </button>
        </div>
      </div>

      {/* 2026 S-Tier Mobile Slide-Over Sheet */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 bottom-0 bg-[#050506]/98 backdrop-blur-2xl border-b border-white/[0.08] p-5 overflow-y-auto flex flex-col justify-between space-y-6 animate-enter-down z-50">
          <div className="space-y-4">
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-2 font-semibold">
              Platform Navigation
            </div>

            <div className="space-y-1">
              <a
                href="#threat-model"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/[0.04] text-zinc-200 text-sm font-medium transition"
              >
                <Shield className="h-4 w-4 text-rose-400" />
                <span>Threat Model (arXiv:2608.09867)</span>
              </a>

              <a
                href="#exploit-visualizer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/[0.04] text-zinc-200 text-sm font-medium transition"
              >
                <Terminal className="h-4 w-4 text-emerald-400" />
                <span>Interactive Exploit Demo</span>
              </a>

              <a
                href="#architecture"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/[0.04] text-zinc-200 text-sm font-medium transition"
              >
                <Cpu className="h-4 w-4 text-cyan-400" />
                <span>Cryptographic Architecture</span>
              </a>

              <a
                href="#benchmarks"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/[0.04] text-zinc-200 text-sm font-medium transition"
              >
                <Activity className="h-4 w-4 text-purple-400" />
                <span>Sub-Millisecond Benchmarks</span>
              </a>

              <Link
                href="/docs"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/[0.04] text-zinc-200 text-sm font-medium transition"
              >
                <BookOpen className="h-4 w-4 text-amber-400" />
                <span>Technical Documentation</span>
              </Link>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/[0.08]">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] active-spring"
            >
              <Activity className="h-4 w-4" />
              <span>Launch Live SOC Sandbox</span>
            </Link>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <a
                href="https://github.com/enabled404/hera"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-1.5 p-2.5 rounded-xl bg-zinc-900 border border-white/[0.06] text-zinc-300 hover:text-white"
              >
                <Github className="h-3.5 w-3.5" />
                <span>GitHub</span>
              </a>

              <a
                href="https://saadkhalidhere.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-1 p-2.5 rounded-xl bg-zinc-900 border border-white/[0.06] text-zinc-300 hover:text-emerald-400"
              >
                <span>Saad Khalid</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
