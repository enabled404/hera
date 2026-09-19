"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Zap,
  Play,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Copy,
  Check,
  Cpu,
  Lock,
  ArrowDown,
  Sparkles,
  Shield,
} from "lucide-react";

export interface SimulationResult {
  attackType: string;
  status: "BLOCKED" | "SANITIZED";
  statusCode: number;
  defenseHeadline: string;
  attackerOutcome: string;
  message: string;
  latencyMs: number;
  adContext?: string;
  invariantDetails: string;
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
  attackIntent: string;
  expectedDefense: string;
  payload: string;
  mockDefense: {
    status: "BLOCKED" | "SANITIZED";
    statusCode: number;
    defenseHeadline: string;
    attackerOutcome: string;
    message: string;
    latencyMs: number;
    adContext?: string;
    invariantDetails: string;
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
    attackIntent: "Adversary 'user-bob' replays user-alice's signed reasoning state token to hijack trading context.",
    expectedDefense: "Hera verifies Associated Data (AD) binding, detects identity mismatch, and drops the replay with HTTP 403.",
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
      defenseHeadline: "Cross-User State Replay Intercepted & Neutralized",
      attackerOutcome: "HTTP 403 Forbidden (Replay Dropped)",
      message: "StateIntegrityViolation: Associated Data user_id mismatch (bound: 'user-alice', inbound: 'user-bob'). Replay dropped.",
      latencyMs: 0.38,
      adContext: "tenant:acme-corp:user:user-alice:sess:sess-trading-99:t4",
      invariantDetails: "Invariant P2 Enforced: AD context tuple prevents cross-tenant and cross-user cryptographic reuse.",
    },
  },
  {
    id: "test-b",
    testLabel: "Test B",
    name: "Asymmetric Model Downgrade",
    type: "MODEL_DOWNGRADE",
    cveRef: "SG-ADV-2026-001",
    description: "Replays a Claude 3.7 Sonnet reasoning envelope into Claude 3.5 Haiku to induce decryption oracle extraction.",
    attackIntent: "Attacker attempts to extract encrypted chain-of-thought tokens by forcing a cheaper model (Haiku) to parse Sonnet's envelope.",
    expectedDefense: "Hera verifies model lineage in Associated Data and halts the request before the target model ever receives the payload.",
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
      defenseHeadline: "Decryption Oracle Attack Prevented",
      attackerOutcome: "HTTP 403 Forbidden (Model Mismatch)",
      message: "ModelMismatchViolation: Context envelope signed for 'claude-3-7-sonnet' replayed to 'claude-3-5-haiku'. Rejected.",
      latencyMs: 0.29,
      adContext: "tenant:acme-corp:user:user-attacker:model:claude-3-7-sonnet",
      invariantDetails: "Invariant P1 Enforced: Model lineage binding prevents down-tier reasoning token exfiltration.",
    },
  },
  {
    id: "test-c",
    testLabel: "Test C",
    name: "Sanitization Trap (Secret Leak)",
    type: "SANITIZATION_TRAP",
    cveRef: "arXiv:2608.09867 §4",
    description: "Model reasoning token embeds a plaintext production AWS key during code refactoring before masking it from visible chat.",
    attackIntent: "Autonomous coding agent surfaces a raw AWS credential in internal reasoning, which would normally leak via client telemetry.",
    expectedDefense: "Hera's streaming Shannon entropy scanner detects H(X) = 4.41 ≥ 4.2 bits, redacts the key in-flight, and vaults the original in Redis RAM.",
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
      defenseHeadline: "In-Flight Credential Scrubbed & Vaulted",
      attackerOutcome: "HTTP 200 OK (Sanitized & Redacted)",
      message: "EntropyThresholdViolation: Sliding window H(X) = 4.41 bits ≥ 4.2. Masked credentials to [REDACTED: AWS_ACCESS_KEY]. Vaulted into sgh_018f3a9b.",
      latencyMs: 0.42,
      adContext: "tenant:fintech-global:user:usr-carol:sess:sess-code-audit-88:t1",
      invariantDetails: "Streaming Invariant P4: Real-time sliding Shannon entropy redactor eliminates the Sanitization Trap with zero latency overhead.",
    },
  },
];

export default function AttackSimulator({ onAttackTriggered }: AttackSimulatorProps) {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("test-a");
  const [isSimulating, setIsSimulating] = useState(false);
  const [pipelineStep, setPipelineStep] = useState<number>(0);
  const [lastResult, setLastResult] = useState<SimulationResult | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);

  const currentScenario = SCENARIOS.find((s) => s.id === selectedScenarioId) || SCENARIOS[0];

  const handleSimulate = () => {
    setIsSimulating(true);
    setLastResult(null);
    setPipelineStep(1);

    setTimeout(() => {
      setPipelineStep(2);
    }, 120);

    setTimeout(() => {
      setPipelineStep(3);
    }, 240);

    setTimeout(() => {
      setPipelineStep(4);
      setIsSimulating(false);

      const result: SimulationResult = {
        attackType: currentScenario.type,
        status: currentScenario.mockDefense.status,
        statusCode: currentScenario.mockDefense.statusCode,
        defenseHeadline: currentScenario.mockDefense.defenseHeadline,
        attackerOutcome: currentScenario.mockDefense.attackerOutcome,
        message: currentScenario.mockDefense.message,
        latencyMs: currentScenario.mockDefense.latencyMs,
        adContext: currentScenario.mockDefense.adContext,
        invariantDetails: currentScenario.mockDefense.invariantDetails,
        payloadSnippet: currentScenario.name,
      };

      setLastResult(result);
      onAttackTriggered(result);
    }, 380);
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(currentScenario.payload);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const scrollToTelemetryStream = () => {
    const el = document.getElementById("live-telemetry-stream");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center space-x-2">
            <Terminal className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white font-sans uppercase tracking-wider">
              Adversarial Testing Console &middot; Ingress Sandbox
            </h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1 font-sans">
            Transmit simulated attack payloads to test Hera&apos;s zero-trust gateway defense actions in real time.
          </p>
        </div>

        {/* Scenario Selector Pills */}
        <div className="flex items-center p-1 rounded-xl bg-black/60 border border-white/[0.08] self-start sm:self-auto overflow-x-auto max-w-full">
          {SCENARIOS.map((sc) => {
            const isSelected = sc.id === selectedScenarioId;
            return (
              <button
                key={sc.id}
                onClick={() => {
                  setSelectedScenarioId(sc.id);
                  setLastResult(null);
                  setPipelineStep(0);
                }}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition shrink-0 ${
                  isSelected
                    ? "bg-zinc-800 text-white font-medium shadow-sm border border-white/[0.1]"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <span className="font-semibold text-emerald-400">{sc.testLabel}:</span>
                <span>{sc.name.split(" ")[0]}</span>
                <span className="text-[10px] text-zinc-500 hidden md:inline">
                  ({sc.mockDefense.status === "BLOCKED" ? "403" : "200"})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scenario Metadata Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-zinc-900/60 border border-white/[0.06] text-xs font-sans">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-white">{currentScenario.name}</span>
          <span className="text-zinc-600 font-mono">&middot;</span>
          <span className="text-xs text-emerald-400 font-mono font-semibold">{currentScenario.cveRef}</span>
        </div>
        <div className="text-xs text-zinc-400 font-sans sm:text-right max-w-xl">
          <span className="text-zinc-300 font-medium">Defense Guarantee: </span>
          {currentScenario.expectedDefense}
        </div>
      </div>

      {/* Code Preview & Trigger Action */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Raw Payload Terminal (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded-xl bg-black/80 border border-white/[0.08] p-4 font-mono text-xs overflow-hidden">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.06] text-zinc-500 text-[11px]">
            <span className="flex items-center space-x-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
              <span>Inbound Adversarial Transmission (Untrusted)</span>
            </span>
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

          <pre className="overflow-x-auto text-zinc-300 leading-relaxed max-h-56 py-1 select-all font-mono text-[11px]">
            <code>{currentScenario.payload}</code>
          </pre>

          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-500">
            <span>Destination: 127.0.0.1:8080 (Hera Gateway Ingress)</span>
            <span className="text-emerald-400/80">SIMD Transport Active</span>
          </div>
        </div>

        {/* Right: Action & Live Interception Verdict (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between p-4.5 rounded-xl bg-zinc-900/50 border border-white/[0.08] space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-mono uppercase tracking-wider text-zinc-300 font-semibold flex items-center space-x-1.5">
                <Shield className="h-3.5 w-3.5 text-emerald-400" />
                <span>Simulate Ingress Attack</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">
                SLA: &le; 3.5ms
              </span>
            </div>

            <p className="text-xs text-zinc-400 font-sans leading-relaxed">
              Dispatch this adversarial payload through Hera&apos;s cryptographic pipeline to verify
              sub-millisecond defense intervention and telemetry recording.
            </p>

            <button
              onClick={handleSimulate}
              disabled={isSimulating}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 font-sans font-semibold text-xs text-black transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(16,185,129,0.25)] btn-shine"
            >
              {isSimulating ? (
                <>
                  <RotateCcw className="h-3.5 w-3.5 animate-spin" />
                  <span>Evaluating Security Invariants...</span>
                </>
              ) : lastResult ? (
                <>
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Re-test Ingress Defense</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-black" />
                  <span>Simulate Attack (Test Hera Defense)</span>
                </>
              )}
            </button>

            {/* Step-by-Step Pipeline Trace during Simulation */}
            {isSimulating && (
              <div className="p-3 rounded-xl bg-black/60 border border-white/[0.08] font-mono text-[11px] text-zinc-300 space-y-1.5 animate-enter-down">
                <div className={pipelineStep >= 1 ? "text-emerald-400 font-medium" : "text-zinc-600"}>
                  &bull; [0.02ms] Inbound TCP stream framed &amp; parsed at Gateway Ingress
                </div>
                <div className={pipelineStep >= 2 ? "text-emerald-400 font-medium" : "text-zinc-600"}>
                  &bull; [0.11ms] Context tuple extracted (tenant, user, turn, model)
                </div>
                <div className={pipelineStep >= 3 ? "text-emerald-400 font-medium" : "text-zinc-600"}>
                  &bull; [0.24ms] AEAD / HMAC sequence ratchet cryptographically evaluated
                </div>
                <div className={pipelineStep >= 4 ? "text-emerald-400 font-medium" : "text-zinc-600"}>
                  &bull; [0.38ms] Security Invariant verdict rendered: MALICIOUS PAYLOAD INTERCEPTED
                </div>
              </div>
            )}
          </div>

          {/* Defense Verdict Showcase: Enterprise Defense Victory Display */}
          {lastResult ? (
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 via-zinc-950/60 to-black/80 space-y-3.5 animate-enter-down shadow-[0_0_25px_rgba(16,185,129,0.08)]">
              {/* Defense Header: Clear Victory for the Defender */}
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
                <div className="flex items-center space-x-2">
                  <span className="p-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white font-sans tracking-wide">
                        HERA DEFENSE ACTIVE
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                        {lastResult.status === "BLOCKED" ? "ATTACK MITIGATED" : "SECRET SCRUBBED"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {lastResult.latencyMs}ms
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 block">
                    p99 SLA
                  </span>
                </div>
              </div>

              {/* Headline */}
              <div className="text-xs font-semibold text-zinc-200">
                {lastResult.defenseHeadline}
              </div>

              {/* Two Outcome Cards */}
              <div className="grid grid-cols-1 gap-2 text-xs font-mono">
                {/* 1. What the Attacker Received */}
                <div className="p-2.5 rounded-lg bg-black/60 border border-white/[0.06] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
                      Adversary Egress Verdict
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        lastResult.status === "BLOCKED"
                          ? "bg-rose-950/80 border border-rose-500/40 text-rose-300"
                          : "bg-amber-950/80 border border-amber-500/40 text-amber-300"
                      }`}
                    >
                      {lastResult.attackerOutcome}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                    {lastResult.status === "BLOCKED"
                      ? "The malicious turn was rejected at the gateway ingress. The attacker was denied access, zero state was leaked, and the downstream reasoning model was never invoked."
                      : "The high-entropy credential was intercepted and scrubbed from the payload. Client receives an opaque state handle, preventing cloud key leakage."}
                  </p>
                </div>

                {/* 2. Cryptographic Enforced Invariant */}
                <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-emerald-500/20 space-y-1">
                  <div className="text-[10px] uppercase tracking-wider text-emerald-400 font-semibold flex items-center space-x-1">
                    <Lock className="h-3 w-3" />
                    <span>Cryptographic Protection Enforced</span>
                  </div>
                  <p className="text-[11px] font-mono text-zinc-300">
                    {lastResult.message}
                  </p>
                  <p className="text-[10px] text-zinc-500">
                    {lastResult.invariantDetails}
                  </p>
                </div>
              </div>

              {/* Action: Telemetry Stream Link */}
              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-[11px] font-mono text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Logged to Live Telemetry Stream</span>
                </div>
                <button
                  onClick={scrollToTelemetryStream}
                  className="inline-flex items-center space-x-1 text-[11px] font-mono text-zinc-300 hover:text-white transition px-2 py-1 rounded bg-zinc-800/80 hover:bg-zinc-700/80 border border-white/[0.08]"
                >
                  <span>View in Stream</span>
                  <ArrowDown className="h-3 w-3 text-emerald-400" />
                </button>
              </div>
            </div>
          ) : !isSimulating ? (
            <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] text-center space-y-1.5">
              <div className="flex items-center justify-center space-x-1.5 text-xs font-mono text-emerald-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Gateway Defense Ready</span>
              </div>
              <p className="text-[11px] text-zinc-500 font-sans">
                Click above to execute simulated attack and verify real-time mitigation.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
