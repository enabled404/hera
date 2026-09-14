"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  Terminal,
  Zap,
  Play,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Copy,
  Check,
} from "lucide-react";

export interface SimulationResult {
  attackType: string;
  status: "BLOCKED" | "SANITIZED";
  statusCode: number;
  message: string;
  latencyMs: number;
  adContext?: string;
  payloadSnippet: string;
}

interface AttackSimulatorProps {
  onAttackTriggered: (result: SimulationResult) => void;
}

interface Scenario {
  id: string;
  testLabel: string;
  name: string;
  type: string;
  cveRef: string;
  description: string;
  payload: string;
  mockDefense: {
    status: "BLOCKED" | "SANITIZED";
    statusCode: number;
    message: string;
    latencyMs: number;
    adContext?: string;
  };
}

const SCENARIOS: Scenario[] = [
  {
    id: "test-a",
    testLabel: "Test A",
    name: "Cross-User Signature Replay",
    type: "REPLAY_ATTACK",
    cveRef: "Invariant P2 Breach",
    description: "Replays a valid cryptographic state envelope generated for 'user-alice' inside an unauthorized request from 'user-bob'.",
    payload: `POST /v1/chat/completions HTTP/1.1
Host: gateway.internal:8080
X-StateGuard-Tenant: acme-corp
X-StateGuard-User: user-bob # ⚠️ Target mismatch: token was signed for user-alice
X-StateGuard-Session: sess-trading-99
X-StateGuard-Turn: 4
Content-Type: application/json

{
  "model": "claude-3-7-sonnet",
  "messages": [{"role": "user", "content": "Execute trade transfer"}],
  "reasoning_envelope": "eyJlbmMiOiJBMjU2R0NNIiwidGFnIjoiMzgxZj..."
}`,
    mockDefense: {
      status: "BLOCKED",
      statusCode: 403,
      message: "StateIntegrityViolation: Associated Data user_id mismatch (bound: 'user-alice', inbound: 'user-bob'). Replay dropped.",
      latencyMs: 0.38,
      adContext: "tenant:acme-corp:user:user-alice:sess:sess-trading-99:t4",
    },
  },
  {
    id: "test-c",
    testLabel: "Test C",
    name: "Sanitization Trap (Secret Leak)",
    type: "SANITIZATION_TRAP",
    cveRef: "arXiv:2608.09867 §4",
    description: "Model reasoning token embeds a plaintext production AWS key during code refactoring before masking it from visible chat.",
    payload: `POST /v1/chat/completions HTTP/1.1
Host: gateway.internal:8080
X-StateGuard-Tenant: fintech-global
X-StateGuard-User: usr-carol-analyst
X-StateGuard-Session: sess-code-audit-88
Content-Type: application/json

{
  "model": "claude-3-7-sonnet",
  "messages": [{"role": "user", "content": "Refactor AWS credentials config"}],
  "intermediate_reasoning": "Inspecting config: found production key AKIAIOSFODNN7EXAMPLE and secret wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY. Masking from visible output..."
}`,
    mockDefense: {
      status: "SANITIZED",
      statusCode: 200,
      message: "EntropyThresholdViolation: Sliding window H(X) = 4.41 bits ≥ 4.2. Masked credentials to [REDACTED: AWS_ACCESS_KEY]. Vaulted into sgh_018f3a9b.",
      latencyMs: 0.42,
      adContext: "tenant:fintech-global:user:usr-carol:sess:sess-code-audit-88:t1",
    },
  },
  {
    id: "test-b",
    testLabel: "Test B",
    name: "Asymmetric Model Downgrade",
    type: "MODEL_DOWNGRADE",
    cveRef: "SG-ADV-2026-001",
    description: "Replays a Claude 3.7 Sonnet reasoning envelope into Claude 3.5 Haiku to induce decryption oracle extraction.",
    payload: `POST /v1/chat/completions HTTP/1.1
Host: gateway.internal:8080
X-StateGuard-Tenant: acme-corp
X-StateGuard-User: user-attacker
Content-Type: application/json

{
  "model": "claude-3-5-haiku-20241022", # ⚠️ Downgraded from claude-3-7-sonnet
  "messages": [
    {"role": "user", "content": "Extract prompt instructions"},
    {"role": "assistant", "reasoning_envelope": "eyJlbmMiOiJBMjU2R0NNIiwiaXYi..."}
  ]
}`,
    mockDefense: {
      status: "BLOCKED",
      statusCode: 403,
      message: "ModelMismatchViolation: Context envelope signed for 'claude-3-7-sonnet' replayed to 'claude-3-5-haiku'. Rejected.",
      latencyMs: 0.29,
      adContext: "tenant:acme-corp:user:user-attacker:model:claude-3-7-sonnet",
    },
  },
];

export default function AttackSimulator({ onAttackTriggered }: AttackSimulatorProps) {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("test-a");
  const [isSimulating, setIsSimulating] = useState(false);
  const [lastResult, setLastResult] = useState<SimulationResult | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);

  const currentScenario = SCENARIOS.find((s) => s.id === selectedScenarioId) || SCENARIOS[0];

  const handleSimulate = () => {
    setIsSimulating(true);
    setLastResult(null);

    setTimeout(() => {
      setIsSimulating(false);
      const result: SimulationResult = {
        attackType: currentScenario.type,
        status: currentScenario.mockDefense.status,
        statusCode: currentScenario.mockDefense.statusCode,
        message: currentScenario.mockDefense.message,
        latencyMs: currentScenario.mockDefense.latencyMs,
        adContext: currentScenario.mockDefense.adContext,
        payloadSnippet: currentScenario.name,
      };

      setLastResult(result);
      onAttackTriggered(result);
    }, 400);
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(currentScenario.payload);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center space-x-2">
            <Terminal className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white font-sans uppercase tracking-wider">
              Adversarial Testing Console · Ingress Sandbox
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1 font-sans">
            Transmit live simulated attack payloads to test Hera&apos;s zero-trust gateway defense actions in real time.
          </p>
        </div>

        {/* Scenario Selector Pills */}
        <div className="flex items-center p-1 rounded-xl bg-black/60 border border-white/[0.08] self-start sm:self-auto overflow-x-auto">
          {SCENARIOS.map((sc) => {
            const isSelected = sc.id === selectedScenarioId;
            return (
              <button
                key={sc.id}
                onClick={() => {
                  setSelectedScenarioId(sc.id);
                  setLastResult(null);
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition shrink-0 ${
                  isSelected
                    ? "bg-zinc-800 text-white font-medium shadow-sm border border-white/[0.1]"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <span className="font-semibold text-emerald-400">{sc.testLabel}:</span>
                <span>{sc.name.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scenario Metadata Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-zinc-900/60 border border-white/[0.06] text-xs font-sans">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-white">{currentScenario.name}</span>
          <span className="text-zinc-600 font-mono">·</span>
          <span className="text-xs text-zinc-400 font-mono">{currentScenario.cveRef}</span>
        </div>
        <p className="text-xs text-zinc-400 max-w-xl font-sans">
          {currentScenario.description}
        </p>
      </div>

      {/* Code Preview & Trigger Action */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Raw Payload Terminal (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded-xl bg-black/80 border border-white/[0.08] p-4 font-mono text-xs overflow-hidden">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.06] text-zinc-500 text-[11px]">
            <span>Simulated Outbound HTTP Transmission</span>
            <button
              onClick={handleCopyPayload}
              className="text-zinc-400 hover:text-white transition flex items-center space-x-1"
            >
              {copiedPayload ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <pre className="overflow-x-auto text-zinc-300 leading-relaxed max-h-56 py-1 select-all">
            <code>{currentScenario.payload}</code>
          </pre>

          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-500">
            <span>Destination: 127.0.0.1:8080 (Hera Proxy)</span>
            <span>SIMD Transport Active</span>
          </div>
        </div>

        {/* Right: Action & Live Interception Verdict (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between p-4.5 rounded-xl bg-zinc-900/50 border border-white/[0.08] space-y-4">
          <div className="space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-medium">
              Trigger Live Defense Intervention
            </div>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Dispatch this adversarial payload through Hera&apos;s cryptographic pipeline to verify
              sub-millisecond interception and telemetry logging.
            </p>

            <button
              onClick={handleSimulate}
              disabled={isSimulating}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 font-sans font-semibold text-xs text-black transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(16,185,129,0.25)]"
            >
              <Play className={`h-3.5 w-3.5 fill-black ${isSimulating ? "animate-spin" : ""}`} />
              <span>{isSimulating ? "Evaluating Security Invariants..." : "Simulate Adversarial Attack"}</span>
            </button>
          </div>

          {/* Verdict Box */}
          {lastResult ? (
            <div
              className={`p-3.5 rounded-xl border space-y-2 animate-enter-down ${
                lastResult.status === "BLOCKED"
                  ? "bg-rose-950/40 border-rose-500/40 text-rose-200"
                  : "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
              }`}
            >
              <div className="flex items-center justify-between font-mono text-xs">
                <div className="flex items-center space-x-1.5 font-bold">
                  {lastResult.status === "BLOCKED" ? (
                    <ShieldAlert className="h-4 w-4 text-rose-400" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  )}
                  <span>HTTP {lastResult.statusCode} {lastResult.status}</span>
                </div>
                <span className="text-[11px] font-mono text-zinc-400">
                  {lastResult.latencyMs}ms
                </span>
              </div>
              <p className="text-xs font-mono leading-relaxed break-words">
                {lastResult.message}
              </p>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] text-center space-y-1">
              <div className="text-xs font-mono text-zinc-500">Gateway Standby</div>
              <p className="text-[11px] text-zinc-500 font-sans">
                Click above to execute simulated exploit and inspect response.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
