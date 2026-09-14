"use client";

import React from "react";
import Link from "next/link";
import { Terminal, ArrowRight, ArrowLeft, FileCode, CheckCircle2 } from "lucide-react";
import DocsBreadcrumb from "@/components/docs/DocsBreadcrumb";
import CodeSnippet from "@/components/docs/CodeSnippet";

export default function DocsCliScannerPage() {
  const cliScanCmd = `# Run an immediate offline audit across JSON/JSONL trajectory logs
stateguard scan ./agent_trajectories/ --format ansi

# Or run via NPX without local installation:
npx stateguard scan ./agent_trajectories/ --format ansi`;

  const sarifCiCmd = `# Generate SARIF output for GitHub Code Scanning / SonarQube
stateguard scan ./logs/ --sarif stateguard-results.sarif

# Batch migrate legacy unencrypted traces with opaque UUIDv7 handles
stateguard migrate \\
  --input ./legacy_transcripts/ \\
  --output ./sanitized_transcripts/ \\
  --gateway-url http://127.0.0.1:8080 \\
  --tenant-key $STATEGUARD_TENANT_KEY`;

  const sampleOutput = `[SCAN COMPLETED] Scanned 48 trajectory files in 14.2ms.
Found 3 Critical Violations:
- [CRITICAL] ./logs/sess_alice.json: Line 42: Sanitization Trap Detected
  Found raw OpenAI API Key (sk-proj-...) in unvaulted reasoning envelope.
- [HIGH] ./logs/sess_bob.json: Line 88: Monotonic Sequence Violation
  Turn 4 parent hash does not match Turn 3 HMAC ratchet.
- [CRITICAL] ./logs/sess_eval.jsonl: Line 102: Cross-Model Lineage Replay
  Claude 3.7 envelope replayed to Haiku endpoint without AD model binding.

SARIF report generated: stateguard-results.sarif (3 findings)`;

  return (
    <div className="space-y-8 animate-enter-down">
      <DocsBreadcrumb category="Deployment & Operations" currentPage="Static CLI Scanner & SARIF" />

      <div className="space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
          Static Trajectory Auditing &amp; Migration CLI
        </h1>
        <p className="text-sm text-zinc-400 font-sans leading-relaxed">
          The <code className="text-zinc-200 font-mono">stateguard</code> CLI inspects historical agent transcripts,
          evaluates Shannon entropy across reasoning blocks, exports SARIF for CI/CD pipelines, and
          batch-migrates unencrypted legacy logs.
        </p>
      </div>

      {/* Basic Scan */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white font-sans">1. Running Trajectory Scans</h2>
        <p className="text-xs text-zinc-400 font-sans leading-relaxed">
          Audit any directory containing OpenAI or Anthropic message logs:
        </p>
        <CodeSnippet code={cliScanCmd} filename="Terminal (Bash)" />
      </div>

      {/* Terminal Output Preview */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white font-sans">Audit Report Output</h2>
        <div className="p-4 rounded-xl bg-black/80 border border-white/[0.08] font-mono text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
          {sampleOutput}
        </div>
      </div>

      {/* SARIF & Migration */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white font-sans">2. CI/CD Integration &amp; Batch Migration</h2>
        <p className="text-xs text-zinc-400 font-sans leading-relaxed">
          Export SARIF reports directly into GitHub Actions Security tabs, or rewrite legacy files with
          cryptographically-signed state handles:
        </p>
        <CodeSnippet code={sarifCiCmd} filename="Terminal (CI/CD Pipeline)" />
      </div>

      {/* Navigation */}
      <div className="pt-6 border-t border-white/[0.08] flex items-center justify-between">
        <Link
          href="/docs/proxy-deployment"
          className="inline-flex items-center space-x-1.5 text-xs font-mono text-zinc-400 hover:text-white transition"
        >
          <ArrowLeft className="h-3 w-3" />
          <span>Proxy Deployment</span>
        </Link>
        <Link
          href="/docs/sdk-reference"
          className="inline-flex items-center space-x-1.5 text-xs font-mono text-emerald-400 hover:text-emerald-300 transition"
        >
          <span>SDK Reference &rarr;</span>
        </Link>
      </div>
    </div>
  );
}
