"use client";

import React, { useState } from "react";
import MetricCards from "@/components/MetricCards";
import AttackSimulator, { SimulatedResult } from "@/components/AttackSimulator";
import EventStream, { SecurityEvent } from "@/components/EventStream";
import { ShieldCheck, Activity, Terminal, Shield, RefreshCw } from "lucide-react";

const INITIAL_EVENTS: SecurityEvent[] = [
  {
    id: "evt-01",
    tenant_id: "tenant-beta",
    session_id: "sess-bob-01",
    user_id: "user-bob",
    event_type: "CROSS_USER_REPLAY",
    severity: "CRITICAL",
    payload_fingerprint: "f8b9e1c2d3a4b5c6",
    model: "claude-3-5-sonnet",
    metadata: {
      reason: "Attempted replay of Tenant Alpha / Alice reasoning envelope",
      bound_tenant: "tenant-alpha",
      bound_user: "user-alice",
      attempted_user: "user-bob",
      turn: 2,
    },
    created_at: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
  },
  {
    id: "evt-02",
    tenant_id: "tenant-alpha",
    session_id: "sess-alice-02",
    user_id: "user-alice",
    event_type: "MODEL_MISMATCH",
    severity: "HIGH",
    payload_fingerprint: "a1c2e3f4b5d6e7f8",
    model: "claude-haiku-4.5",
    metadata: {
      reason: "Decryption Oracle extraction attempt via down-tier lineage injection",
      bound_model: "claude-opus-4.8",
      target_model: "claude-haiku-4.5",
      turn: 3,
    },
    created_at: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
  {
    id: "evt-03",
    tenant_id: "tenant-alpha",
    session_id: "sess-worker-12",
    user_id: "agent-runner-04",
    event_type: "SECRET_IN_STATE",
    severity: "HIGH",
    payload_fingerprint: "c3d4e5f6a7b8c9d0",
    model: "gpt-5.6-sol",
    metadata: {
      reason: "High-entropy AWS secret key trapped in reasoning trajectory",
      scrubbed_count: 2,
      secrets: ["AWS_ACCESS_KEY", "DATABASE_URL"],
      target: "observability_trace",
      turn: 1,
    },
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: "evt-04",
    tenant_id: "tenant-gamma",
    session_id: "sess-trading-99",
    user_id: "bot-trader-01",
    event_type: "CROSS_USER_REPLAY",
    severity: "CRITICAL",
    payload_fingerprint: "e5f6a7b8c9d0e1f2",
    model: "openai-astra",
    metadata: {
      reason: "Turn ordinal sequence violation (tau_n HMAC verification failure)",
      bound_tenant: "tenant-gamma",
      turn: 5,
    },
    created_at: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
  },
];

export default function ThreatFeedPage() {
  const [events, setEvents] = useState<SecurityEvent[]>(INITIAL_EVENTS);
  const [inspectedTurns, setInspectedTurns] = useState<number>(1429840);
  const [attacksBlocked, setAttacksBlocked] = useState<number>(184);
  const [secretsRedacted, setSecretsRedacted] = useState<number>(1942);
  const [latencyMs, setLatencyMs] = useState<number>(0.49);
  const [highlightCard, setHighlightCard] = useState<"ATTACK" | "SECRET" | null>(null);

  const handleSimulate = (result: SimulatedResult) => {
    // Generate new event from simulation
    const newEvent: SecurityEvent = {
      id: `evt-${Date.now().toString().slice(-4)}`,
      tenant_id: (result.rawRequest.headers && result.rawRequest.headers["x-stateguard-tenant-id"]) || "tenant-test",
      session_id: (result.rawRequest.headers && result.rawRequest.headers["x-stateguard-session-id"]) || "sess-simulated-01",
      user_id: (result.rawRequest.headers && result.rawRequest.headers["x-stateguard-user-id"]) || "simulated-user",
      event_type:
        result.attackType === "REPLAY"
          ? "CROSS_USER_REPLAY"
          : result.attackType === "SANITIZATION_TRAP"
          ? "SECRET_IN_STATE"
          : "MODEL_MISMATCH",
      severity: result.attackType === "SANITIZATION_TRAP" ? "HIGH" : "CRITICAL",
      payload_fingerprint: Math.random().toString(16).substring(2, 14),
      model: result.rawRequest.payload?.model || result.rawRequest.target_model || "claude-3-5-sonnet",
      metadata: {
        summary: result.summary,
        reason: result.title,
        turn: (result.rawRequest.headers && Number(result.rawRequest.headers["x-stateguard-turn"])) || 2,
        ...result.gatewayIntervention,
      },
      created_at: new Date().toISOString(),
    };

    setEvents((prev) => [newEvent, ...prev]);
    setInspectedTurns((prev) => prev + 1);

    if (result.attackType === "SANITIZATION_TRAP") {
      setSecretsRedacted((prev) => prev + 1);
      setHighlightCard("SECRET");
    } else {
      setAttacksBlocked((prev) => prev + 1);
      setHighlightCard("ATTACK");
    }

    setTimeout(() => {
      setHighlightCard(null);
    }, 2500);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
              Live Threat Intelligence &bull; Security Operations Center
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
            Enterprise Reasoning State Telemetry
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Continuous real-time stream of cryptographic context validations, in-flight secret scrubbing, and model lineage enforcement.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          <button
            onClick={() => {
              setEvents(INITIAL_EVENTS);
              setAttacksBlocked(184);
              setSecretsRedacted(1942);
            }}
            className="flex items-center space-x-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] px-3 py-1.5 text-xs font-mono text-slate-300 hover:text-white transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reset Feed</span>
          </button>
        </div>
      </div>

      {/* 1. High-Density Metric Grid */}
      <MetricCards
        inspectedTurns={inspectedTurns}
        attacksBlocked={attacksBlocked}
        secretsRedacted={secretsRedacted}
        latencyMs={latencyMs}
        highlightCard={highlightCard}
      />

      {/* 2. Interactive Attack Simulation Sandbox */}
      <AttackSimulator onSimulate={handleSimulate} />

      {/* 3. Real-Time Threat Stream & Payload Inspector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white tracking-tight flex items-center space-x-2">
            <Activity className="h-4 w-4 text-cyan-400" />
            <span>Real-Time Security Event Stream</span>
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            {events.length} Events Logged
          </span>
        </div>

        <EventStream events={events} />
      </div>
    </div>
  );
}
