"use client";

import React from "react";
import Link from "next/link";
import {
  Shield,
  Terminal,
  Zap,
  Cpu,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Server,
  Layers,
} from "lucide-react";
import DocsBreadcrumb from "@/components/docs/DocsBreadcrumb";
import CodeSnippet from "@/components/docs/CodeSnippet";

const docsJsonLd = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  "headline": "Hera StateGuard Documentation & Technical Specifications",
  "description":
    "Comprehensive reference documentation for Hera StateGuard: reverse proxy deployment, CLI scanner, cryptographic invariants, and SDK integrations.",
  "url": "https://herasec.vercel.app/docs",
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
};

export default function DocsOverviewPage() {
  const quickstartDocker = `# Clone the repository
git clone https://github.com/enabled404/hera.git
cd hera

# Configure your master tenant key
export STATEGUARD_TENANT_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"

# Launch Redis cache and StateGuard zero-copy proxy
docker compose up -d

# Verify gateway readiness on localhost:8080
curl -i http://127.0.0.1:8080/health`;

  const quickstartCli = `# Run static trajectory security audit without installation
npx stateguard scan ./agent_trajectories --sarif report.sarif

# Or install native compiled Rust binary
curl -fsSL https://raw.githubusercontent.com/enabled404/hera/main/install.sh | bash
stateguard scan ./agent_logs/`;

  const pythonExample = `import openai

# Point OpenAI client directly through Hera StateGuard reverse proxy
client = openai.OpenAI(
    base_url="http://127.0.0.1:8080/v1",
    api_key="sk-your-openai-key",
    default_headers={
        "X-StateGuard-Tenant": "acme-corp",
        "X-StateGuard-User": "usr_alice",
        "X-StateGuard-Session": "sess_491",
        "X-StateGuard-Branch": "main",
        "X-StateGuard-Turn": "1",
    }
)

response = client.chat.completions.create(
    model="claude-3-7-sonnet", # or gpt-4o / o3
    messages=[{"role": "user", "content": "Audit and sanitize repo config"}]
)

# Client receives opaque state handle instead of raw reasoning traces
print(response.choices[0].message.content)
print("Protected State Handle:", response.stateguard_handle)`;

  return (
    <div className="space-y-8 animate-enter-down">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(docsJsonLd) }}
      />
      <DocsBreadcrumb category="Getting Started" currentPage="Overview & Quickstart" />

      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-500/30 text-[11px] font-mono text-emerald-400">
          <Shield className="h-3.5 w-3.5" />
          <span>v1.1.0 Production-Ready</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
          Hera StateGuard Overview &amp; Quickstart
        </h1>
        <p className="text-sm text-zinc-400 font-sans leading-relaxed">
          Hera (Engine: StateGuard) is an open-source, high-performance cryptographic reverse proxy and
          state vault for autonomous AI agent workflows. It enforces zero-trust contextual binding,
          in-flight streaming secret redaction, and eliminates chain-of-thought data leakage.
        </p>
      </div>

      {/* Core Objectives Box */}
      <div id="what-hera-solves" className="glass-panel rounded-xl p-5 space-y-3">
        <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-200 flex items-center space-x-2">
          <Zap className="h-4 w-4 text-emerald-400" />
          <span>What Hera Solves</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-zinc-300 font-sans">
          <div className="flex items-start space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Blocks Cross-User &amp; Model Lineage Replay Attacks</span>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Masks High-Entropy Secrets Trapped in Agent Memory</span>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Replaces Client-Held Reasoning with Opaque UUID Handles</span>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>Maintains Sub-Millisecond Overhead (&lt; 0.49ms p99)</span>
          </div>
        </div>
      </div>

      {/* Quickstart Section 1: Docker Compose */}
      <div id="docker-quickstart" className="space-y-3">
        <h2 className="text-lg font-bold text-white font-sans">
          1. Quickstart with Docker Compose
        </h2>
        <p className="text-xs text-zinc-400 font-sans leading-relaxed">
          The fastest way to deploy Hera locally is via the pre-configured Docker Compose cluster,
          which starts the SIMD-accelerated Rust proxy on port 8080 backed by an in-memory Redis cache.
        </p>
        <CodeSnippet code={quickstartDocker} filename="Terminal (Bash)" />
      </div>

      {/* Quickstart Section 2: Zero-Install NPX Scanner */}
      <div id="cli-scanner-quickstart" className="space-y-3">
        <h2 className="text-lg font-bold text-white font-sans">
          2. Zero-Install CLI Trajectory Scanner
        </h2>
        <p className="text-xs text-zinc-400 font-sans leading-relaxed">
          Audit existing agent conversation logs and LangSmith/Datadog trace dumps for the Sanitization
          Trap or exposed thinking tokens without installing any native dependencies:
        </p>
        <CodeSnippet code={quickstartCli} filename="Terminal (CLI Scan)" />
      </div>

      {/* Quickstart Section 3: SDK Integration */}
      <div id="sdk-route-quickstart" className="space-y-3">
        <h2 className="text-lg font-bold text-white font-sans">
          3. Route Agent Requests via Hera
        </h2>
        <p className="text-xs text-zinc-400 font-sans leading-relaxed">
          In your Python or TypeScript application, update the OpenAI/Anthropic SDK base URL to point to
          the Hera gateway and attach the required zero-trust context binding headers:
        </p>
        <CodeSnippet code={pythonExample} language="python" filename="agent_worker.py" />
      </div>

      {/* Navigation to Next Topics */}
      <div className="pt-6 border-t border-white/[0.08] flex items-center justify-between">
        <span className="text-xs text-zinc-500 font-mono">Next: Core Concepts</span>
        <Link
          href="/docs/architecture"
          className="inline-flex items-center space-x-1.5 text-xs font-mono text-emerald-400 hover:text-emerald-300 transition"
        >
          <span>System Architecture &amp; Invariants</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
