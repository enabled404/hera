"use client";

import React from "react";
import Link from "next/link";
import { Code, ArrowLeft, Terminal, ShieldCheck, CheckCircle } from "lucide-react";
import DocsBreadcrumb from "@/components/docs/DocsBreadcrumb";
import CodeSnippet from "@/components/docs/CodeSnippet";

export default function DocsSdkReferencePage() {
  const pythonOtel = `# Python: In-Memory OTel Span Processor Scrubbing
from opentelemetry import trace
from stateguard.otel import StateGuardSanitizingSpanProcessor

tracer_provider = trace.get_tracer_provider()
# Intercepts raw thinking envelopes and API keys before export to Datadog/LangSmith
tracer_provider.add_span_processor(
    StateGuardSanitizingSpanProcessor(entropy_threshold=4.2)
)`;

  const pythonLangchain = `# Python: LangChain In-Place State Sanitizer
from langchain_openai import ChatOpenAI
from stateguard.langchain import StateGuardCallbackHandler

llm = ChatOpenAI(
    model="gpt-4o",
    callbacks=[StateGuardCallbackHandler(proxy_url="http://127.0.0.1:8080")]
)`;

  const tsVercelAi = `// TypeScript: Vercel AI SDK Zero-Trust Middleware
import { createOpenAI } from '@ai-sdk/openai';
import { createStateGuardAiMiddleware } from '@stateguard/sdk';

const openai = createOpenAI({
  baseURL: 'http://127.0.0.1:8080/v1',
  headers: {
    'X-StateGuard-Tenant': 'acme-corp',
    'X-StateGuard-User': 'usr_alice',
  }
});

// Attach stateguard in-flight entropy and handle interception
export const stateguardModel = createStateGuardAiMiddleware(openai('claude-3-7-sonnet'), {
  maskSecrets: true,
  entropyThreshold: 4.2
});`;

  return (
    <div className="space-y-8 animate-enter-down">
      <DocsBreadcrumb category="SDK & Framework Hooks" currentPage="SDK Reference" />

      <div className="space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">
          SDK Reference &amp; In-Process Hooks
        </h1>
        <p className="text-sm text-zinc-400 font-sans leading-relaxed">
          StateGuard provides lightweight SDKs and zero-dependency hooks for Python and TypeScript to
          intercept in-memory spans and reasoning tokens before third-party APM exporters broadcast them.
        </p>
      </div>

      {/* Python SDK */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white font-sans">Python SDK (OpenTelemetry &amp; LangChain)</h2>
        <div className="text-xs text-zinc-400 font-sans leading-relaxed">
          Install via pip: <code className="text-zinc-200 font-mono bg-zinc-900 px-2 py-0.5 rounded">pip install stateguard[otel,langchain]</code>
        </div>
        <CodeSnippet code={pythonOtel} language="python" filename="tracing.py (OpenTelemetry)" />
        <CodeSnippet code={pythonLangchain} language="python" filename="agent.py (LangChain)" />
      </div>

      {/* TypeScript SDK */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-white font-sans">TypeScript SDK (Vercel AI SDK &amp; Node)</h2>
        <div className="text-xs text-zinc-400 font-sans leading-relaxed">
          Install via npm: <code className="text-zinc-200 font-mono bg-zinc-900 px-2 py-0.5 rounded">npm install @stateguard/sdk</code>
        </div>
        <CodeSnippet code={tsVercelAi} language="typescript" filename="ai.ts (Vercel AI SDK)" />
      </div>

      {/* Navigation */}
      <div className="pt-6 border-t border-white/[0.08] flex items-center justify-between">
        <Link
          href="/docs/cli-scanner"
          className="inline-flex items-center space-x-1.5 text-xs font-mono text-zinc-400 hover:text-white transition"
        >
          <ArrowLeft className="h-3 w-3" />
          <span>CLI Scanner &amp; SARIF</span>
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex items-center space-x-1.5 text-xs font-mono text-emerald-400 hover:text-emerald-300 transition"
        >
          <span>Explore Live SOC Sandbox &rarr;</span>
        </Link>
      </div>
    </div>
  );
}
