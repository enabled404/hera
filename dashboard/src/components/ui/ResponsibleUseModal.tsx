"use client";

import React, { useState, useEffect } from "react";
import { Shield, ShieldAlert, X, Check, Lock, FileText, Scale } from "lucide-react";

interface ResponsibleUseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ResponsibleUseModal({
  isOpen,
  onClose,
}: ResponsibleUseModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-enter-down">
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl glass-panel border-t sm:border border-white/[0.12] p-5 sm:p-8 shadow-2xl space-y-5 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center space-x-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Scale className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-sans tracking-tight">
                Terms of Service &amp; Responsible Use
              </h2>
              <p className="text-xs font-mono text-zinc-400">
                Project Hera &middot; StateGuard Core v1.1
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="touch-target rounded-lg p-2 text-zinc-400 hover:text-white hover:bg-white/[0.08] transition active-spring"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Clauses */}
        <div className="space-y-4 text-xs font-sans text-zinc-300 leading-relaxed">
          {/* Clause 1 */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-1.5">
            <div className="flex items-center space-x-1.5 font-semibold text-emerald-400 font-mono uppercase tracking-wider text-[11px]">
              <Shield className="h-3.5 w-3.5" />
              <span>1. Defensive Research &amp; Educational Purpose</span>
            </div>
            <p className="text-zinc-400">
              The simulation engine, interactive sandboxes, and cryptographic test vectors provided within Project Hera are designed solely for defensive cybersecurity research, educational evaluation, and compliance auditing. They serve to validate zero-trust state boundaries and mitigate cryptographic contextual misbinding in autonomous reasoning systems (arXiv:2608.09867).
            </p>
          </div>

          {/* Clause 2 */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-1.5">
            <div className="flex items-center space-x-1.5 font-semibold text-cyan-400 font-mono uppercase tracking-wider text-[11px]">
              <Lock className="h-3.5 w-3.5" />
              <span>2. Non-Weaponization &amp; Acceptable Use</span>
            </div>
            <p className="text-zinc-400">
              Hera does not provide, host, or endorse weaponized exploits. All attack payloads in the console are synthetic, in-memory test vectors structured to test ingress interceptors. Users agree not to utilize Hera&apos;s codebase or APIs to facilitate unauthorized intrusion, malicious state replay, or adversarial prompt exfiltration against external endpoints.
            </p>
          </div>

          {/* Clause 3 */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-1.5">
            <div className="flex items-center space-x-1.5 font-semibold text-zinc-300 font-mono uppercase tracking-wider text-[11px]">
              <FileText className="h-3.5 w-3.5 text-zinc-400" />
              <span>3. Apache 2.0 License &amp; Limitation of Liability</span>
            </div>
            <p className="text-zinc-400">
              The software and SDKs are licensed under the Apache License, Version 2.0. The software is provided on an &ldquo;AS IS&rdquo; BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied, including, without limitation, any warranties of title, non-infringement, merchantability, or fitness for a particular purpose. In no event shall the author or contributors be liable for any claim or damages.
            </p>
          </div>

          {/* Clause 4 */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] space-y-1.5">
            <div className="flex items-center space-x-1.5 font-semibold text-emerald-400 font-mono uppercase tracking-wider text-[11px]">
              <Check className="h-3.5 w-3.5" />
              <span>4. Local Client-Side Sandbox Guarantee</span>
            </div>
            <p className="text-zinc-400">
              Interactive sandboxes, entropy scanners, and simulation playgrounds operate 100% locally in your browser memory. No live credentials, proprietary code, or production telemetry are logged, stored, or transmitted to any remote server during evaluation sessions.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/[0.08]">
          <div className="text-[11px] font-mono text-zinc-500">
            Lead Architect: Saad Khalid (&lrm;saadkhalid2000@outlook.com)
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-mono font-medium text-white transition"
          >
            Acknowledge &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
}
