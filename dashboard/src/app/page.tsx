"use client";

import React, { useState, useEffect } from "react";

interface SecurityEvent {
  id: string;
  tenant_id: string;
  session_id?: string;
  event_type: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  payload_fingerprint?: string;
  metadata: Record<string, any>;
  created_at: string;
}

const INITIAL_EVENTS: SecurityEvent[] = [
  {
    id: "evt-01",
    tenant_id: "tenant-beta",
    session_id: "sess-bob-01",
    event_type: "CROSS_USER_REPLAY",
    severity: "CRITICAL",
    payload_fingerprint: "f8b9e1c2d3a4",
    metadata: {
      reason: "Attempted replay of Tenant Alpha / Alice reasoning envelope",
      bound_tenant: "tenant-alpha",
      bound_user: "user-alice",
      attempted_user: "user-bob",
    },
    created_at: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
  },
  {
    id: "evt-02",
    tenant_id: "tenant-alpha",
    session_id: "sess-alice-02",
    event_type: "MODEL_MISMATCH",
    severity: "HIGH",
    payload_fingerprint: "a1c2e3f4b5d6",
    metadata: {
      reason: "Decryption Oracle extraction attempt",
      bound_model: "claude-opus-4.8",
      target_model: "claude-haiku-4.5",
    },
    created_at: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
  {
    id: "evt-03",
    tenant_id: "tenant-alpha",
    session_id: "sess-worker-12",
    event_type: "SECRET_IN_STATE",
    severity: "HIGH",
    payload_fingerprint: "c3d4e5f6a7b8",
    metadata: {
      scrubbed_count: 2,
      secrets: ["ANTHROPIC_KEY", "DATABASE_URL"],
      target: "observability_trace",
    },
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
];

export default function ThreatFeedPage() {
  const [events, setEvents] = useState<SecurityEvent[]>(INITIAL_EVENTS);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");

  const filteredEvents =
    activeFilter === "ALL"
      ? events
      : events.filter((e) => e.event_type === activeFilter);

  return (
    <div className="space-y-8">
      {/* Top Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0e1322] border border-slate-800/80 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Inspected Turns
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono text-white tracking-tight">
              1,429,840
            </span>
            <span className="text-xs text-emerald-400 font-mono">+12.4% today</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-mono">
            Zero-copy SSE parsing active
          </div>
        </div>

        <div className="bg-[#0e1322] border border-slate-800/80 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-mono text-rose-400 uppercase tracking-wider">
            Attacks Blocked
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono text-rose-300 tracking-tight">
              184
            </span>
            <span className="text-xs text-rose-400 font-mono">100% Intercepted</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-mono">
            Cross-tenant & model downgrades
          </div>
        </div>

        <div className="bg-[#0e1322] border border-slate-800/80 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-mono text-amber-400 uppercase tracking-wider">
            Secrets Redacted
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono text-amber-300 tracking-tight">
              1,942
            </span>
            <span className="text-xs text-amber-400 font-mono">Sanitization Trap</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-mono">
            Scrubbed before Datadog / OTel
          </div>
        </div>

        <div className="bg-[#0e1322] border border-slate-800/80 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-mono text-indigo-400 uppercase tracking-wider">
            Stream Latency (p99)
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono text-indigo-300 tracking-tight">
              1.18 ms
            </span>
            <span className="text-xs text-emerald-400 font-mono">SLA &le; 3.5ms</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-mono">
            Hyper / Tokio async pipeline
          </div>
        </div>
      </div>

      {/* Security Event Feed */}
      <div className="bg-[#0c101c] border border-slate-800/80 rounded-xl overflow-hidden shadow-lg">
        <div className="px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-white">
              Real-Time Security Event Stream
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live cryptographic context binding and sanitization alerts
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 font-mono text-xs">
            {["ALL", "CROSS_USER_REPLAY", "MODEL_MISMATCH", "SECRET_IN_STATE"].map(
              (filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-2.5 py-1 rounded-md transition ${
                    activeFilter === filter
                      ? "bg-indigo-600 text-white shadow"
                      : "bg-slate-800/60 text-slate-400 hover:text-white"
                  }`}
                >
                  {filter}
                </button>
              )
            )}
          </div>
        </div>

        <div className="divide-y divide-slate-800/60">
          {filteredEvents.map((evt) => {
            const isCrit = evt.severity === "CRITICAL";
            return (
              <div
                key={evt.id}
                className="px-6 py-4 hover:bg-slate-800/30 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold uppercase ${
                        isCrit
                          ? "bg-rose-950/60 border border-rose-500/40 text-rose-300"
                          : "bg-amber-950/60 border border-amber-500/40 text-amber-300"
                      }`}
                    >
                      {evt.severity}
                    </span>
                    <span className="font-mono text-sm font-semibold text-slate-200">
                      {evt.event_type}
                    </span>
                    {evt.payload_fingerprint && (
                      <span className="text-[11px] font-mono text-slate-500">
                        fp: {evt.payload_fingerprint}
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-300">
                    {evt.metadata.reason || "Integrity violation detected and dropped"}
                  </div>

                  <div className="flex flex-wrap gap-4 text-[11px] font-mono text-slate-500">
                    <span>Tenant: {evt.tenant_id}</span>
                    {evt.session_id && <span>Session: {evt.session_id}</span>}
                    {evt.metadata.bound_model && (
                      <span>Bound Model: {evt.metadata.bound_model}</span>
                    )}
                    {evt.metadata.target_model && (
                      <span className="text-rose-400">Target Model: {evt.metadata.target_model}</span>
                    )}
                  </div>
                </div>

                <div className="text-right text-xs font-mono text-slate-500 whitespace-nowrap">
                  {new Date(evt.created_at).toLocaleTimeString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
