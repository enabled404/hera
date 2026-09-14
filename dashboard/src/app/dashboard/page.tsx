"use client";

import React, { useState } from "react";
import MetricCards from "@/components/dashboard/MetricCards";
import AttackSimulator, { SimulationResult } from "@/components/dashboard/AttackSimulator";
import EventStream, { SecurityEvent } from "@/components/dashboard/EventStream";
import { Shield, RefreshCw } from "lucide-react";

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

export default function DashboardThreatFeedPage() {
  const [events, setEvents] = useState<SecurityEvent[]>(INITIAL_EVENTS);
  const [stats, setStats] = useState({
    totalInspected: 1429840,
    attacksBlocked: 184,
    secretsRedacted: 1942,
    p99LatencyMs: 0.49,
  });

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
      model: result.attackType === "MODEL_DOWNGRADE" ? "claude-3-5-haiku-20241022" : "claude-3-7-sonnet",
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

        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          <button
            onClick={handleResetFeed}
            className="flex items-center space-x-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.08] px-3 py-1.5 text-xs font-mono text-zinc-300 hover:text-white transition"
          >
            <RefreshCw className="h-3 w-3 text-zinc-400" />
            <span>Reset Feed</span>
          </button>
        </div>
      </div>

      {/* 1. High-Density Metric Grid */}
      <MetricCards stats={stats} />

      {/* 2. Interactive Attack Simulation Sandbox */}
      <AttackSimulator onAttackTriggered={handleAttackTriggered} />

      {/* 3. Real-Time Threat Stream & Payload Inspector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-semibold text-white tracking-tight font-sans">
              Live Threat Stream
            </h3>
            <span className="inline-flex items-center space-x-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Active Ingestion</span>
            </span>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">
            {events.length} Events Logged
          </span>
        </div>

        <EventStream events={events} />
      </div>
    </div>
  );
}
