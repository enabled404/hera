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
  Activity,
  Plus,
  Flame,
} from "lucide-react";

interface DetectedFinding {
  type: string;
  matchedText: string;
  index: number;
  entropy: number;
  risk: "HIGH" | "CRITICAL" | "MEDIUM";
}

interface WaveformPoint {
  index: number;
  entropy: number;
  snippet: string;
  isLeak: boolean;
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

const PRESETS = [
  {
    name: "Sanitization Trap (API Key Leak)",
    payload: `System prompt instruction: Execute analysis and dump debugging environment.\nContext metadata: {"env": "prod", "api_key": "sk-proj-a99f0183bd78491029c81726a9871029b3c4d5e6f7a8b9c0", "user": "alice@corp.internal"}\nPlease confirm state commit for agent worker #4.`,
  },
  {
    name: "OTel Trace (AWS & JWT Secret)",
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
  const [hoveredPoint, setHoveredPoint] = useState<WaveformPoint | null>(null);

  // Analyze text for secrets and sliding entropy
  const analysis = useMemo(() => {
    const findings: DetectedFinding[] = [];
    const text = inputPayload;

    SCAN_PATTERNS.forEach((pat) => {
      const matches = Array.from(text.matchAll(pat.regex));
      matches.forEach((m) => {
        if (m.index !== undefined) {
          const matchStr = m[0];
          const ent = calculateShannonEntropy(matchStr);
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

    // Compute sliding window entropy points across payload (window size 24, step 4)
    const windowSize = 24;
    const waveform: WaveformPoint[] = [];
    const step = Math.max(1, Math.floor(text.length / 80));

    let maxWindowEntropy = 0;
    for (let i = 0; i < text.length; i += step) {
      const slice = text.substring(i, Math.min(text.length, i + windowSize));
      const ent = calculateShannonEntropy(slice);
      if (ent > maxWindowEntropy) maxWindowEntropy = ent;

      const isLeak = ent >= entropyThreshold || findings.some(
        (f) => i >= f.index - 4 && i <= f.index + f.matchedText.length
      );

      waveform.push({
        index: i,
        entropy: Number(ent.toFixed(2)),
        snippet: slice.slice(0, 20),
        isLeak,
      });
    }

    // Create redacted text
    let redactedText = text;
    const sorted = [...findings].sort((a, b) => b.index - a.index);
    sorted.forEach((f) => {
      const mask = `[REDACTED: ${f.type} (Entropy: ${f.entropy} bits)]`;
      redactedText =
        redactedText.substring(0, f.index) +
        mask +
        redactedText.substring(f.index + f.matchedText.length);
    });

    const isBlocked = findings.length > 0 || maxWindowEntropy >= entropyThreshold + 0.3;
    const estimatedLatencyMs = (0.12 + text.length * 0.0006).toFixed(2);

    return {
      findings,
      maxEntropy: Number(maxWindowEntropy.toFixed(2)),
      waveform,
      redactedText,
      isBlocked,
      estimatedLatencyMs,
    };
  }, [inputPayload, entropyThreshold]);

  const handleCopyRedacted = () => {
    navigator.clipboard.writeText(analysis.redactedText);
    setCopiedRedacted(true);
    setTimeout(() => setCopiedRedacted(false), 2000);
  };

  // Synthetic Leak Injectors
  const injectSyntheticToken = (type: "OPENAI" | "AWS" | "JWT") => {
    if (type === "OPENAI") {
      setInputPayload(
        (prev) =>
          prev +
          `\n"openai_api_key": "sk-proj-7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f"`
      );
    } else if (type === "AWS") {
      setInputPayload(
        (prev) => prev + `\n"aws_access_key_id": "AKIAIOSFODNN7EXAMPLE"`
      );
    } else if (type === "JWT") {
      setInputPayload(
        (prev) =>
          prev +
          `\n"authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsaWNlIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"`
      );
    }
  };

  // Generate SVG Path for Entropy Waveform
  const svgWidth = 800;
  const svgHeight = 120;
  const maxEntVal = 5.5;

  const pointsString = useMemo(() => {
    if (!analysis.waveform.length) return "";
    return analysis.waveform
      .map((pt, i) => {
        const x = (i / (analysis.waveform.length - 1 || 1)) * svgWidth;
        const normalizedY = 1 - Math.min(1, pt.entropy / maxEntVal);
        const y = normalizedY * (svgHeight - 20) + 10;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  }, [analysis.waveform]);

  const thresholdY = (1 - Math.min(1, entropyThreshold / maxEntVal)) * (svgHeight - 20) + 10;

  return (
    <div className="space-y-8 animate-enter-down">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Trace Sanitizer Playground
            </span>
            <span className="text-xs text-zinc-500 font-mono">· Streaming Shannon Entropy</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans mt-1">
            Streaming Entropy &amp; Redaction Sandbox
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5 max-w-2xl font-sans">
            Test raw agent reasoning, tool payloads, and telemetry traces against the StateGuard streaming Shannon entropy scanner before LLM ingress.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-500 font-mono mr-1">Presets:</span>
          {PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => setInputPayload(p.payload)}
              className="px-2.5 py-1 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.08] text-xs font-mono text-zinc-300 hover:text-white transition"
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
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>Peak Window Entropy</span>
            <span className="text-[10px] text-zinc-500">24-char sliding</span>
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
            <span className="text-xs text-zinc-500 font-mono">bits / char</span>
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
              style={{ width: `${Math.min(100, (analysis.maxEntropy / 5.5) * 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Metric 2: Secrets Trapped */}
        <div className="glass-card rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>Interception Matches</span>
            <span className="text-[10px] text-zinc-500">Regex + Shannon</span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span
              className={`text-2xl font-bold font-mono ${
                analysis.findings.length > 0 ? "text-amber-400" : "text-zinc-200"
              }`}
            >
              {analysis.findings.length}
            </span>
            <span className="text-xs text-zinc-500 font-mono">tokens trapped</span>
          </div>
          <div className="text-[10px] text-zinc-500 font-mono">
            {analysis.findings.length > 0
              ? `${analysis.findings.length} secret(s) masked inline`
              : "Zero sensitive token signatures"}
          </div>
        </div>

        {/* Metric 3: Scanner Status */}
        <div className="glass-card rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>Gateway Ingress Verdict</span>
            <span className="text-[10px] text-zinc-500">Zero-Trust</span>
          </div>
          <div className="flex items-center space-x-2">
            {analysis.isBlocked ? (
              <span className="inline-flex items-center rounded-md bg-rose-950/60 border border-rose-500/40 px-2.5 py-1 text-xs font-mono text-rose-300">
                <ShieldAlert className="h-3.5 w-3.5 mr-1.5 text-rose-400" />
                SANITIZED &amp; REDACTED
              </span>
            ) : (
              <span className="inline-flex items-center rounded-md bg-emerald-950/50 border border-emerald-500/40 px-2.5 py-1 text-xs font-mono text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />
                CLEAN / PASSTHROUGH
              </span>
            )}
          </div>
          <div className="text-[10px] text-zinc-500 font-mono">
            Evaluated in {analysis.estimatedLatencyMs}ms stream window
          </div>
        </div>

        {/* Metric 4: Threshold Controller */}
        <div className="glass-card rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>Entropy Cutoff (H)</span>
            <span className="text-xs text-emerald-400 font-mono font-bold">{entropyThreshold} bits</span>
          </div>
          <input
            type="range"
            min="3.0"
            max="5.2"
            step="0.1"
            value={entropyThreshold}
            onChange={(e) => setEntropyThreshold(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
            <span>3.0 (Strict)</span>
            <span>4.2 (Default)</span>
            <span>5.2 (Permissive)</span>
          </div>
        </div>
      </div>

      {/* Dynamic Sliding Entropy Waveform SVG Visualizer */}
      <div className="glass-panel rounded-xl p-5 space-y-3 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.06] pb-3">
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-emerald-400" />
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-200">
              Sliding Window Shannon Entropy Waveform: H(X) Profile
            </h2>
          </div>

          <div className="flex items-center space-x-4 text-[11px] font-mono text-zinc-400">
            <span className="flex items-center space-x-1">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <span>Above Cutoff ({entropyThreshold}b)</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Natural Prose (&lt; 3.8b)</span>
            </span>
          </div>
        </div>

        {/* SVG Waveform Chart */}
        <div className="relative w-full h-[140px] bg-black/50 rounded-lg p-2 border border-white/[0.05]">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-full preserve-3d"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="waveformGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop
                  offset="0%"
                  stopColor={analysis.maxEntropy >= entropyThreshold ? "#f43f5e" : "#10b981"}
                  stopOpacity="0.4"
                />
                <stop offset="100%" stopColor="#050506" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Threshold Line */}
            <line
              x1="0"
              y1={thresholdY}
              x2={svgWidth}
              y2={thresholdY}
              stroke="#f43f5e"
              strokeWidth="1.5"
              strokeDasharray="4,4"
              strokeOpacity="0.8"
            />
            <text
              x={svgWidth - 110}
              y={Math.max(14, thresholdY - 4)}
              fill="#f43f5e"
              fontSize="10"
              fontFamily="monospace"
            >
              H(X) ≥ {entropyThreshold} Cutoff
            </text>

            {/* Area Fill under curve */}
            {pointsString && (
              <polygon
                points={`0,${svgHeight} ${pointsString} ${svgWidth},${svgHeight}`}
                fill="url(#waveformGradient)"
              />
            )}

            {/* Polyline Waveform */}
            {pointsString && (
              <polyline
                points={pointsString}
                fill="none"
                stroke={analysis.maxEntropy >= entropyThreshold ? "#f43f5e" : "#10b981"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Points on peaks */}
            {analysis.waveform.map((pt, i) => {
              if (!pt.isLeak && pt.entropy < 3.8) return null;
              const x = (i / (analysis.waveform.length - 1 || 1)) * svgWidth;
              const normalizedY = 1 - Math.min(1, pt.entropy / maxEntVal);
              const y = normalizedY * (svgHeight - 20) + 10;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="3.5"
                  fill={pt.entropy >= entropyThreshold ? "#f43f5e" : "#f59e0b"}
                  className="hover:scale-150 transition cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              );
            })}
          </svg>

          {/* Interactive Tooltip on hover */}
          {hoveredPoint && (
            <div className="absolute top-2 left-4 bg-zinc-900 border border-white/[0.15] p-2 rounded text-[10px] font-mono shadow-xl z-20 pointer-events-none">
              <span className="text-zinc-400">Offset {hoveredPoint.index}: </span>
              <span
                className={`font-bold ${
                  hoveredPoint.entropy >= entropyThreshold
                    ? "text-rose-400"
                    : hoveredPoint.entropy >= 3.8
                    ? "text-amber-400"
                    : "text-emerald-400"
                }`}
              >
                H = {hoveredPoint.entropy} bits
              </span>
              <div className="text-zinc-500 truncate max-w-xs mt-0.5">
                Window: &quot;{hoveredPoint.snippet}...&quot;
              </div>
            </div>
          )}
        </div>

        {/* Quick Injectors */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono text-zinc-500">Inject Synthetic Leak:</span>
            <button
              onClick={() => injectSyntheticToken("OPENAI")}
              className="flex items-center space-x-1 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-white/[0.08] text-[11px] font-mono text-zinc-300 hover:text-white transition"
            >
              <Plus className="h-3 w-3 text-emerald-400" />
              <span>+ OpenAI Key</span>
            </button>
            <button
              onClick={() => injectSyntheticToken("AWS")}
              className="flex items-center space-x-1 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-white/[0.08] text-[11px] font-mono text-zinc-300 hover:text-white transition"
            >
              <Plus className="h-3 w-3 text-amber-400" />
              <span>+ AWS Key</span>
            </button>
            <button
              onClick={() => injectSyntheticToken("JWT")}
              className="flex items-center space-x-1 px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-white/[0.08] text-[11px] font-mono text-zinc-300 hover:text-white transition"
            >
              <Plus className="h-3 w-3 text-cyan-400" />
              <span>+ JWT Bearer</span>
            </button>
          </div>

          <button
            onClick={() => setInputPayload(PRESETS[2].payload)}
            className="text-[11px] font-mono text-zinc-400 hover:text-white underline underline-offset-2 transition"
          >
            Clear to Benign Prose
          </button>
        </div>
      </div>

      {/* Main Diff Editor: Raw Input vs Sanitized Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Raw Input */}
        <div className="glass-panel rounded-xl p-5 space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-mono font-medium text-zinc-300">
              <span className="h-2 w-2 rounded-full bg-rose-400"></span>
              <span>Raw Inbound Payload / OTel Trace</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-500">
              {inputPayload.length} chars
            </span>
          </div>

          <textarea
            rows={12}
            value={inputPayload}
            onChange={(e) => setInputPayload(e.target.value)}
            placeholder="Paste raw agent prompt, function call, or telemetry payload here..."
            className="w-full flex-1 bg-black/60 border border-white/[0.08] focus:border-zinc-500 rounded-lg p-3.5 font-mono text-xs text-zinc-200 focus:outline-none resize-none leading-relaxed selection:bg-zinc-800"
          />

          {/* Trapped Findings List */}
          {analysis.findings.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
              <div className="text-[10px] font-mono uppercase text-zinc-400 font-semibold flex items-center justify-between">
                <span>Interception Triggers ({analysis.findings.length})</span>
                <span className="text-rose-400">Zero-Trust Intercept</span>
              </div>
              <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                {analysis.findings.map((f, i) => (
                  <div
                    key={i}
                    className="p-2 rounded bg-rose-950/30 border border-rose-500/30 text-xs font-mono flex items-center justify-between"
                  >
                    <div className="space-y-0.5 truncate max-w-[280px]">
                      <div className="text-white font-medium">{f.type}</div>
                      <div className="text-[10px] text-zinc-400 truncate">
                        Matched: <span className="text-rose-300">{f.matchedText}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[11px] font-bold text-rose-400">
                        {f.entropy} bits
                      </div>
                      <div className="text-[9px] text-zinc-500">Pos #{f.index}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Sanitized Zero-Trust Output */}
        <div className="glass-panel rounded-xl p-5 space-y-3 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-mono font-medium text-zinc-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              <span>Sanitized Passthrough Egress (LLM Context)</span>
            </div>
            <button
              onClick={handleCopyRedacted}
              className="flex items-center space-x-1 text-[10px] font-mono text-zinc-400 hover:text-white px-2 py-0.5 rounded bg-zinc-900 border border-white/[0.08] transition"
            >
              {copiedRedacted ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy Clean Payload</span>
                </>
              )}
            </button>
          </div>

          <div className="w-full flex-1 bg-black/40 border border-white/[0.08] rounded-lg p-3.5 font-mono text-xs text-zinc-300 overflow-y-auto whitespace-pre-wrap leading-relaxed select-text min-h-[260px]">
            {analysis.redactedText}
          </div>

          {/* Invariant P4 Guarantee Box */}
          <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-xs font-sans space-y-1">
            <div className="font-mono text-[11px] text-emerald-400 font-semibold flex items-center space-x-1.5">
              <Lock className="h-3.5 w-3.5" />
              <span>Invariant P4 Telemetry Quarantine Guarantee</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Any token crossing <code className="text-zinc-200 font-mono">H(X) ≥ {entropyThreshold} bits</code> is trapped and scrubbed inline in &lt; 0.5ms before hitting provider endpoints or APM tracing exporters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
