"use client";

import React, { useState, useEffect } from "react";
import MetricCards from "@/components/dashboard/MetricCards";
import AttackSimulator, { SimulationResult } from "@/components/dashboard/AttackSimulator";
import EventStream, { SecurityEvent } from "@/components/dashboard/EventStream";
import {
  Shield,
  RefreshCw,
  Play,
  Pause,
  Zap,
  Activity,
  Radio,
  Sliders,
} from "lucide-react";

const INITIAL_EVENTS: SecurityEvent[] = [
  {
    id: "evt-01",
    tenant_id: "acme-corp",
    session_id: "sess-trading-99",
    user_id: "user-bob",
    event_type: "CROSS_USER_REPLAY",
    severity: "CRITICAL",
    payload_fingerprint: "sgh_0191e4a2-8b3c-7890-a1b2-c3d4e5f6a7b8",
    model: "claude-3-7-sonnet",
    metadata: {
      reason: "Attempted replay of user-alice reasoning envelope under user-bob session context",
      bound_tenant: "acme-corp",
      bound_user: "user-alice",
      attempted_user: "user-bob",
      turn: 4,
    },
    created_at: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
  },
  {
    id: "evt-02",
    tenant_id: "acme-corp",
    session_id: "sess-downgrade-eval",
    user_id: "user-attacker",
    event_type: "MODEL_MISMATCH",
    severity: "HIGH",
    payload_fingerprint: "sgh_0191e4a3-9c4d-8901-b2c3-d4e5f6a7b8c9",
    model: "claude-3-5-haiku-20241022",
    metadata: {
      reason: "Decryption Oracle extraction attempt via down-tier lineage injection",
      bound_model: "claude-3-7-sonnet",
      target_model: "claude-3-5-haiku-20241022",
      turn: 3,
    },
    created_at: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
  {
    id: "evt-03",
    tenant_id: "fintech-global",
    session_id: "sess-code-audit-88",
    user_id: "usr-carol-analyst",
    event_type: "SECRET_IN_STATE",
    severity: "HIGH",
    payload_fingerprint: "sgh_0191e4a4-ad5e-9012-c3d4-e5f6a7b8c9d0",
    model: "claude-3-7-sonnet",
    metadata: {
      reason: "High-entropy AWS secret key trapped in reasoning trajectory",
      scrubbed_count: 1,
      secrets: ["AWS_ACCESS_KEY"],
      turn: 1,
    },
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: "evt-04",
    tenant_id: "fintech-cloud-sec",
    session_id: "sess-pipeline-04",
    user_id: "usr-dan-secops",
    event_type: "CROSS_USER_REPLAY",
    severity: "CRITICAL",
    payload_fingerprint: "sgh_0191e4a5-be6f-0123-d4e5-f6a7b8c9d0e1",
    model: "gpt-4o",
    metadata: {
      reason: "Turn ordinal sequence violation (HMAC sequence ratchet failure)",
      bound_tenant: "fintech-cloud-sec",
      turn: 5,
    },
    created_at: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
  },
];

// Realistic synthetic streaming pool
const STREAM_SAMPLE_TEMPLATES = [
  {
    tenant: "fintech-cloud-sec",
    user: "usr_alice_architect",
    session: "sess-agent-worker-09",
    type: "CROSS_USER_REPLAY",
    severity: "CRITICAL" as const,
    model: "claude-3-7-sonnet",
    reason: "Cryptographic context mismatch: user context 'usr_mallory' rejected for session 'usr_alice_architect'",
  },
  {
    tenant: "acme-corp",
    user: "usr_pipeline_runner",
    session: "sess-langchain-agent-12",
    type: "SECRET_IN_STATE",
    severity: "HIGH" as const,
    model: "gpt-4o",
    reason: "OpenTelemetry span intercepted: OpenAI sk-proj key redacted inline (H=4.82 bits)",
  },
  {
    tenant: "global-health-ai",
    user: "usr_research_lead",
    session: "sess-claude-audit-77",
    type: "MODEL_MISMATCH",
    severity: "HIGH" as const,
    model: "claude-3-5-haiku-20241022",
    reason: "Model lineage downgrade attempt: state bound to Opus cannot be decrypted by Haiku",
  },
];

export default function DashboardThreatFeedPage() {
  const [events, setEvents] = useState<SecurityEvent[]>(INITIAL_EVENTS);
  const [stats, setStats] = useState({
    totalInspected: 1429840,
    attacksBlocked: 184,
    secretsRedacted: 1942,
    p99LatencyMs: 0.49,
  });

  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [streamIntervalMs, setStreamIntervalMs] = useState<number>(8000);
  const [lastPacketTime, setLastPacketTime] = useState<string>("Just now");

  // Background Simulated Telemetry Stream Engine
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const template =
        STREAM_SAMPLE_TEMPLATES[Math.floor(Math.random() * STREAM_SAMPLE_TEMPLATES.length)];

      const newEvt: SecurityEvent = {
        id: `evt-${Date.now().toString().slice(-4)}`,
        tenant_id: template.tenant,
        session_id: template.session,
        user_id: template.user,
        event_type: template.type,
        severity: template.severity,
        payload_fingerprint: `sgh_${Math.random().toString(16).substring(2, 10)}`,
        model: template.model,
        metadata: {
          reason: template.reason,
          turn: Math.floor(Math.random() * 6) + 1,
        },
        created_at: new Date().toISOString(),
      };

      setEvents((prev) => [newEvt, ...prev.slice(0, 49)]); // keep latest 50 events
      setLastPacketTime(new Date().toLocaleTimeString());

      setStats((prev) => ({
        ...prev,
        totalInspected: prev.totalInspected + Math.floor(Math.random() * 12) + 4,
        attacksBlocked:
          template.type !== "SECRET_IN_STATE"
            ? prev.attacksBlocked + 1
            : prev.attacksBlocked,
        secretsRedacted:
          template.type === "SECRET_IN_STATE"
            ? prev.secretsRedacted + 1
            : prev.secretsRedacted,
      }));
    }, streamIntervalMs);

    return () => clearInterval(interval);
  }, [isStreaming, streamIntervalMs]);

  const handleAttackTriggered = (result: SimulationResult) => {
    const newEvent: SecurityEvent = {
      id: `evt-${Date.now().toString().slice(-4)}`,
      tenant_id: "acme-corp",
      session_id: "sess-sandbox-sim",
      user_id: result.attackType === "REPLAY_ATTACK" ? "user-bob" : "usr-carol",
      event_type:
        result.attackType === "REPLAY_ATTACK"
          ? "CROSS_USER_REPLAY"
          : result.attackType === "MODEL_DOWNGRADE"
          ? "MODEL_MISMATCH"
          : "SECRET_IN_STATE",
      severity: result.attackType === "SANITIZATION_TRAP" ? "HIGH" : "CRITICAL",
      payload_fingerprint: `sgh_${Math.random().toString(16).substring(2, 10)}`,
      model:
        result.attackType === "MODEL_DOWNGRADE"
          ? "claude-3-5-haiku-20241022"
          : "claude-3-7-sonnet",
      metadata: {
        reason: result.message,
        turn: 2,
        context: result.adContext,
      },
      created_at: new Date().toISOString(),
    };

    setEvents((prev) => [newEvent, ...prev]);

    setStats((prev) => ({
      ...prev,
      totalInspected: prev.totalInspected + 1,
      attacksBlocked:
        result.status === "BLOCKED" ? prev.attacksBlocked + 1 : prev.attacksBlocked,
      secretsRedacted:
        result.status === "SANITIZED" ? prev.secretsRedacted + 1 : prev.secretsRedacted,
    }));
  };

  const handleBurstSimulation = () => {
    const burstEvents: SecurityEvent[] = STREAM_SAMPLE_TEMPLATES.map((tmpl, idx) => ({
      id: `evt-burst-${Date.now().toString().slice(-3)}-${idx}`,
      tenant_id: tmpl.tenant,
      session_id: tmpl.session,
      user_id: tmpl.user,
      event_type: tmpl.type,
      severity: tmpl.severity,
      payload_fingerprint: `sgh_${Math.random().toString(16).substring(2, 10)}`,
      model: tmpl.model,
      metadata: {
        reason: tmpl.reason,
        turn: idx + 1,
      },
      created_at: new Date().toISOString(),
    }));

    setEvents((prev) => [...burstEvents, ...prev]);
    setStats((prev) => ({
      ...prev,
      totalInspected: prev.totalInspected + 25,
      attacksBlocked: prev.attacksBlocked + 2,
      secretsRedacted: prev.secretsRedacted + 1,
    }));
  };

  const handleResetFeed = () => {
    setEvents(INITIAL_EVENTS);
    setStats({
      totalInspected: 1429840,
      attacksBlocked: 184,
      secretsRedacted: 1942,
      p99LatencyMs: 0.49,
    });
  };

  return (
    <div className="space-y-6 animate-enter-down">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              Live Threat Stream &amp; Interactive Sandbox
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans mt-1">
            Enterprise Reasoning State Telemetry
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5 max-w-2xl font-sans">
            Continuous real-time stream of cryptographic context validations, in-flight secret scrubbing, and model lineage enforcement.
          </p>
        </div>

        {/* Streaming Controls Bar */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* Live Stream Toggle Button */}
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition border ${
              isStreaming
                ? "bg-emerald-950/50 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50"
                : "bg-zinc-900 border-white/[0.08] text-zinc-400 hover:text-white"
            }`}
          >
            {isStreaming ? (
              <>
                <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
                <span>Stream: LIVE</span>
              </>
            ) : (
              <>
                <Pause className="h-3 w-3 text-zinc-400" />
                <span>Stream: PAUSED</span>
              </>
            )}
          </button>

          {/* Burst Injection Button */}
          <button
            onClick={handleBurstSimulation}
            className="flex items-center space-x-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.08] px-3 py-1.5 text-xs font-mono text-zinc-300 hover:text-white transition"
            title="Inject multi-tenant concurrent burst"
          >
            <Zap className="h-3 w-3 text-amber-400" />
            <span>Burst (3x)</span>
          </button>

          <button
            onClick={handleResetFeed}
            className="flex items-center space-x-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.08] px-3 py-1.5 text-xs font-mono text-zinc-400 hover:text-white transition"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* 1. High-Density Metric Grid */}
      <MetricCards stats={stats} />

      {/* 2. Interactive Attack Simulation Sandbox */}
      <AttackSimulator onAttackTriggered={handleAttackTriggered} />

      {/* 3. Real-Time Threat Stream & Payload Inspector */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-semibold text-white tracking-tight font-sans">
              Live Ingestion Stream
            </h3>
            <span className="inline-flex items-center space-x-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              <span className={`h-1.5 w-1.5 rounded-full bg-emerald-400 ${isStreaming ? "animate-pulse" : ""}`} />
              <span>{isStreaming ? "Active Ingestion (~120 req/s)" : "Ingestion Paused"}</span>
            </span>
          </div>

          <div className="flex items-center space-x-3 text-[11px] font-mono text-zinc-500">
            <span>Last packet: {lastPacketTime}</span>
            <span>&middot;</span>
            <span>{events.length} Events In-Memory</span>
          </div>
        </div>

        <EventStream events={events} />
      </div>
    </div>
  );
}
