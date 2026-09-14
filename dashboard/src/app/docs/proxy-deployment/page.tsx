"use client";

import React from "react";
import Link from "next/link";
import { Server, ArrowRight, ArrowLeft, Terminal, Shield, CheckCircle } from "lucide-react";
import DocsBreadcrumb from "@/components/docs/DocsBreadcrumb";
import CodeSnippet from "@/components/docs/CodeSnippet";

export default function DocsProxyDeploymentPage() {
  const envConfig = `# Core Gateway Configuration
STATEGUARD_LISTEN_ADDR="0.0.0.0:8080"
STATEGUARD_TENANT_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
STATEGUARD_VAULT_MODE="STATEFUL_VAULT" # Options: STATEFUL_VAULT | STATELESS_BINDING

# Upstream LLM Endpoints
UPSTREAM_OPENAI_URL="https://api.openai.com/v1"
UPSTREAM_ANTHROPIC_URL="https://api.anthropic.com/v1"

# In-Memory Cache (Redis / Dragonfly)
REDIS_URL="redis://127.0.0.1:6379"
VAULT_STATE_TTL_SECONDS=3600

# Streaming Security Policy
ENTROPY_THRESHOLD=4.2
ENFORCE_DAG_LINEAGE=true
QUARANTINE_CROSS_USER=true`;

  const dockerCompose = `version: "3.8"
services:
  stateguard-proxy:
    image: ghcr.io/enabled404/stateguard-proxy:v1.1.0
    ports:
      - "8080:8080"
    environment:
      - STATEGUARD_TENANT_KEY=\${STATEGUARD_TENANT_KEY}
      - REDIS_URL=redis://redis:6379
      - STATEGUARD_VAULT_MODE=STATEFUL_VAULT
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  redis_data:`;

  return (
    <div className="space-y-8 animate-enter-down">
      <DocsBreadcrumb category="Deployment & Operations" currentPage="Reverse Proxy Deployment" />

      <div className="space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
          Reverse Proxy Production Deployment
        </h1>
        <p className="text-sm text-zinc-400 font-sans leading-relaxed">
          Deploy <code className="text-zinc-200 font-mono">stateguard-proxy</code> as a high-throughput,
          zero-copy reverse proxy in front of OpenAI, Anthropic, or custom local reasoning models.
        </p>
      </div>

      {/* Production Architecture */}
      <div className="glass-panel rounded-xl p-5 space-y-3">
        <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-200 flex items-center space-x-2">
          <Server className="h-4 w-4 text-emerald-400" />
          <span>Ingress Architecture</span>
        </h2>
        <div className="font-mono text-xs text-zinc-300 p-3 rounded-lg bg-black/60 border border-white/[0.06] leading-relaxed">
          Agent Application &rarr; [Hera Proxy:8080] &rarr; [Upstream LLM Provider]
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&darr;
          <br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[Redis Vault Cache]
        </div>
      </div>

      {/* Environment Config */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white font-sans">Configuration Environment Variables</h2>
        <p className="text-xs text-zinc-400 font-sans leading-relaxed">
          Configure proxy behavior via environment variables or a <code className="text-zinc-300 font-mono">.env</code> file:
        </p>
        <CodeSnippet code={envConfig} language="bash" filename=".env.production" />
      </div>

      {/* Docker Compose */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white font-sans">Production Docker Compose</h2>
        <p className="text-xs text-zinc-400 font-sans leading-relaxed">
          Run Hera alongside Redis with automatic health monitoring and container restarts:
        </p>
        <CodeSnippet code={dockerCompose} language="yaml" filename="docker-compose.yml" />
      </div>

      {/* Navigation */}
      <div className="pt-6 border-t border-white/[0.08] flex items-center justify-between">
        <Link
          href="/docs/threat-model"
          className="inline-flex items-center space-x-1.5 text-xs font-mono text-zinc-400 hover:text-white transition"
        >
          <ArrowLeft className="h-3 w-3" />
          <span>Threat Model</span>
        </Link>
        <Link
          href="/docs/cli-scanner"
          className="inline-flex items-center space-x-1.5 text-xs font-mono text-emerald-400 hover:text-emerald-300 transition"
        >
          <span>CLI Scanner &amp; SARIF &rarr;</span>
        </Link>
      </div>
    </div>
  );
}
