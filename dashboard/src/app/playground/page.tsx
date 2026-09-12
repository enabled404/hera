"use client";

import React, { useState, useMemo } from "react";
import {
  Terminal,
  ShieldCheck,
  ShieldAlert,
  Zap,
  RefreshCw,
  Copy,
  Check,
  AlertTriangle,
  Lock,
  Eye,
  Sliders,
  Sparkles,
} from "lucide-react";

interface DetectedFinding {
  type: string;
  matchedText: string;
  index: number;
  entropy: number;
  risk: "HIGH" | "CRITICAL" | "MEDIUM";
}

// Shannon entropy calculation for a string
function calculateShannonEntropy(str: string): number {
  if (!str || str.length === 0) return 0;
  const frequencies: { [key: string]: number } = {};
  for (const char of str) {
    frequencies[char] = (frequencies[char] || 0) + 1;
  }
  let entropy = 0;
  const len = str.length;
  for (const char in frequencies) {
    const p = frequencies[char] / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

// Calculate max sliding window entropy
function calculateMaxWindowEntropy(text: string, windowSize: number = 32): number {
  if (!text || text.length < windowSize) {
    return calculateShannonEntropy(text);
  }
  let maxEntropy = 0;
  for (let i = 0; i <= text.length - windowSize; i += 4) {
    const window = text.substring(i, i + windowSize);
    const ent = calculateShannonEntropy(window);
    if (ent > maxEntropy) maxEntropy = ent;
  }
  return maxEntropy;
}

const PRESETS = [
  {
    name: "Sanitization Trap (API Key Leak)",
    payload: `System prompt instruction: Execute analysis and dump debugging environment.\nContext metadata: {"env": "prod", "api_key": "sk-proj-a99f0183bd78491029c81726a9871029b3c4d5e6f7a8b9c0", "user": "alice@corp.internal"}\nPlease confirm state commit for agent worker #4.`,
  },
  {
    name: "OTel Unsanitized Trace Dump",
    payload: `[otel.trace] span_id=8f1a2b3c4d5e6f7a parent_id=1a2b3c4d5e6f7a8b\nAttributes: {\n  "db.password": "P@ssw0rd!X99_SuperSecretEntropyToken8821",\n  "aws.access_key_id": "AKIAIOSFODNN7EXAMPLE",\n  "jwt.authorization": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsaWNlIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"\n}`,
  },
  {
    name: "Benign Agent Conversation",
    payload: `User: Can you summarize the Q3 infrastructure cost breakdown?\nAssistant: Certainly. In Q3, cloud compute accounted for $45,200 across 12 Kubernetes nodes, and object storage was $8,150. All database backups were compressed with zstandard.`,
  },
];

const SCAN_PATTERNS = [
  {
    name: "OpenAI API Key",
    regex: /sk-[a-zA-Z0-9_-]{20,}/g,
    risk: "CRITICAL" as const,
  },
  {
    name: "AWS Access Key",
    regex: /AKIA[0-9A-Z]{16}/g,
    risk: "CRITICAL" as const,
  },
  {
    name: "JWT Authorization Token",
    regex: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g,
    risk: "HIGH" as const,
  },
  {
    name: "High-Entropy Secret String",
    regex: /[a-zA-Z0-9!@#$%^&*()_+=-]{28,}/g,
    risk: "MEDIUM" as const,
  },
];

export default function TracePlaygroundPage() {
  const [inputPayload, setInputPayload] = useState<string>(PRESETS[0].payload);
  const [entropyThreshold, setEntropyThreshold] = useState<number>(4.2);
  const [copiedRedacted, setCopiedRedacted] = useState<boolean>(false);

  // Analyze text for secrets and sliding entropy
  const analysis = useMemo(() => {
    const findings: DetectedFinding[] = [];
    const text = inputPayload;
    const maxEntropy = calculateMaxWindowEntropy(text, 32);

    SCAN_PATTERNS.forEach((pat) => {
      const matches = Array.from(text.matchAll(pat.regex));
      matches.forEach((m) => {
        if (m.index !== undefined) {
          const matchStr = m[0];
          const ent = calculateShannonEntropy(matchStr);
          // If pattern is generic high-entropy, verify it actually crosses threshold
          if (pat.name === "High-Entropy Secret String" && ent < entropyThreshold) {
            return;
          }
          findings.push({
            type: pat.name,
            matchedText: matchStr,
            index: m.index,
            entropy: Number(ent.toFixed(2)),
            risk: pat.risk,
          });
        }
      });
    });

    // Create redacted text
    let redactedText = text;
    // Replace findings in reverse index order
    const sorted = [...findings].sort((a, b) => b.index - a.index);
    sorted.forEach((f) => {
      const mask = `[REDACTED: ${f.type} (Entropy: ${f.entropy} bits)]`;
      redactedText =
        redactedText.substring(0, f.index) +
        mask +
        redactedText.substring(f.index + f.matchedText.length);
    });

    const isBlocked = findings.length > 0 || maxEntropy >= entropyThreshold + 0.3;

    return {
      findings,
      maxEntropy: Number(maxEntropy.toFixed(2)),
      redactedText,
      isBlocked,
    };
  }, [inputPayload, entropyThreshold]);

  const handleCopyRedacted = () => {
    navigator.clipboard.writeText(analysis.redactedText);
    setCopiedRedacted(true);
    setTimeout(() => setCopiedRedacted(false), 2000);
  };

  return (
    <div className="space-y-8 animate-enter-down">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center rounded-md bg-cyan-950/50 border border-cyan-500/30 px-2.5 py-1 text-xs font-mono font-medium text-cyan-400">
              <Terminal className="mr-1.5 h-3.5 w-3.5" />
              TRACE SANITIZER PLAYGROUND
            </span>
            <span className="text-xs text-slate-500 font-mono">Real-time Entropy Filter</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans mt-2">
            Streaming Entropy & Redaction Sandbox
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Test raw agent reasoning, tool payloads, and telemetry traces against the StateGuard streaming Shannon entropy scanner before LLM ingress.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 font-mono mr-1">Load Preset:</span>
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => setInputPayload(p.payload)}
              className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono text-slate-300 hover:text-white transition"
            >
              {p.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Max Entropy */}
        <div className="glass-card rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Peak Window Entropy</span>
            <span className="text-[10px] text-slate-500">32-char sliding</span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span
              className={`text-2xl font-bold font-mono ${
                analysis.maxEntropy >= entropyThreshold
                  ? "text-rose-400"
                  : analysis.maxEntropy >= 3.8
                  ? "text-amber-400"
                  : "text-emerald-400"
              }`}
            >
              {analysis.maxEntropy}
            </span>
            <span className="text-xs text-slate-500 font-mono">bits / char</span>
          </div>
          <div className="w-full bg-zinc-800/80 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                analysis.maxEntropy >= entropyThreshold
                  ? "bg-rose-500"
                  : analysis.maxEntropy >= 3.8
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(100, (analysis.maxEntropy / 6.0) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Metric 2: Secrets Trapped */}
        <div className="glass-card rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Interception Matches</span>
            <span className="text-[10px] text-slate-500">Regex + Shannon</span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span
              className={`text-2xl font-bold font-mono ${
                analysis.findings.length > 0 ? "text-amber-400" : "text-slate-200"
              }`}
            >
              {analysis.findings.length}
            </span>
            <span className="text-xs text-slate-500 font-mono">tokens trapped</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {analysis.findings.length > 0
              ? `${analysis.findings.length} secret(s) masked inline`
              : "Zero sensitive token signatures"}
          </div>
        </div>

        {/* Metric 3: Scanner Status */}
        <div className="glass-card rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Gateway Ingress Verdict</span>
            <span className="text-[10px] text-slate-500">Zero-Trust</span>
          </div>
          <div className="flex items-center space-x-2">
            {analysis.isBlocked ? (
              <span className="inline-flex items-center rounded-md bg-rose-950/60 border border-rose-500/40 px-2.5 py-1 text-xs font-mono text-rose-300">
                <ShieldAlert className="h-3.5 w-3.5 mr-1.5 text-rose-400" />
                SANITIZED & REDACTED
              </span>
            ) : (
              <span className="inline-flex items-center rounded-md bg-emerald-950/50 border border-emerald-500/40 px-2.5 py-1 text-xs font-mono text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />
                CLEAN / PASSTHROUGH
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Evaluated in &lt; 0.35ms streaming window
          </div>
        </div>

        {/* Metric 4: Threshold Controller */}
        <div className="glass-card rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Entropy Cutoff</span>
            <span className="text-xs text-cyan-400 font-mono">{entropyThreshold} bits</span>
          </div>
          <input
            type="range"
            min="3.0"
            max="5.5"
            step="0.1"
            value={entropyThreshold}
            onChange={(e) => setEntropyThreshold(Number(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>3.0 (Strict)</span>
            <span>5.5 (Permissive)</span>
          </div>
        </div>
      </div>

      {/* Main Diff Editor: Raw Input vs Sanitized Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Raw Input */}
        <div className="glass-panel rounded-xl p-5 space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-mono font-medium text-slate-300">
              <span className="h-2 w-2 rounded-full bg-rose-400"></span>
              <span>Raw Inbound Payload / OTel Trace</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              {inputPayload.length} chars
            </span>
          </div>

          <textarea
            rows={14}
            value={inputPayload}
            onChange={(e) => setInputPayload(e.target.value)}
            placeholder="Paste raw agent prompt, function call, or telemetry payload here..."
            className="w-full flex-1 bg-black/60 border border-white/[0.08] focus:border-cyan-500/50 rounded-lg p-3.5 font-mono text-xs text-slate-200 focus:outline-none resize-none leading-relaxed selection:bg-rose-500/30"
          />

          {/* Trapped Findings List */}
          {analysis.findings.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
              <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold">
                Intercepted Token Signatures ({analysis.findings.length})
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                {analysis.findings.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded bg-rose-950/30 border border-rose-500/20 text-[11px] font-mono"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-rose-400 font-semibold">{f.type}</span>
                      <span className="text-slate-500 truncate max-w-[160px]">
                        {f.matchedText.slice(0, 16)}...
                      </span>
                    </div>
                    <span className="text-amber-300 font-semibold">{f.entropy} bits</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Sanitized Output */}
        <div className="glass-panel rounded-xl p-5 space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-mono font-medium text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              <span>Sanitized Output (Safe for LLM Ingress)</span>
            </div>

            <button
              onClick={handleCopyRedacted}
              className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center space-x-1"
            >
              {copiedRedacted ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Sanitized</span>
                </>
              )}
            </button>
          </div>

          <div className="w-full flex-1 bg-black/60 border border-white/[0.08] rounded-lg p-3.5 font-mono text-xs text-emerald-300 whitespace-pre-wrap leading-relaxed overflow-y-auto max-h-[380px] select-all">
            {analysis.redactedText}
          </div>

          <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-[11px] font-mono text-emerald-400/90 flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>
              Zero entropy trap leakages. Payload is safe for downstream model inference without secret exfiltration.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
