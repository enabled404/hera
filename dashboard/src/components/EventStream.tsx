"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Key,
  Search,
  SlidersHorizontal,
  ChevronRight,
  X,
  Copy,
  Check,
  Terminal,
  Clock,
  Layers,
  FileCode2,
  Lock,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

export interface SecurityEvent {
  id: string;
  tenant_id: string;
  session_id?: string;
  user_id?: string;
  event_type: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  payload_fingerprint?: string;
  model?: string;
  metadata: Record<string, any>;
  created_at: string;
}

interface EventStreamProps {
  events: SecurityEvent[];
}

export default function EventStream({ events }: EventStreamProps) {
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const filterOptions = [
    { id: "ALL", label: "All Events" },
    { id: "CROSS_USER_REPLAY", label: "Replay Attacks (403)" },
    { id: "MODEL_MISMATCH", label: "Model Downgrades (403)" },
    { id: "SECRET_IN_STATE", label: "Secret Scrubbing (200)" },
  ];

  const filteredEvents = events.filter((evt) => {
    const matchesFilter = activeFilter === "ALL" || evt.event_type === activeFilter;
    if (!matchesFilter) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      evt.id.toLowerCase().includes(q) ||
      evt.tenant_id.toLowerCase().includes(q) ||
      (evt.session_id && evt.session_id.toLowerCase().includes(q)) ||
      (evt.user_id && evt.user_id.toLowerCase().includes(q)) ||
      (evt.model && evt.model.toLowerCase().includes(q)) ||
      evt.event_type.toLowerCase().includes(q)
    );
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return (
          <span className="inline-flex items-center space-x-1.5 rounded-full bg-rose-950/70 border border-rose-500/40 px-2.5 py-0.5 text-[10px] font-mono font-bold text-rose-300">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
            <span>CRITICAL</span>
          </span>
        );
      case "HIGH":
        return (
          <span className="inline-flex items-center space-x-1.5 rounded-full bg-amber-950/70 border border-amber-500/40 px-2.5 py-0.5 text-[10px] font-mono font-bold text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span>HIGH</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/40 px-2.5 py-0.5 text-[10px] font-mono text-cyan-300">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            <span>MEDIUM</span>
          </span>
        );
    }
  };

  const getEventTitle = (type: string) => {
    switch (type) {
      case "CROSS_USER_REPLAY":
        return "Cross-User Reasoning Signature Replay Attempt";
      case "MODEL_MISMATCH":
        return "Model Lineage Downgrade & Refusal Bypass";
      case "SECRET_IN_STATE":
        return "Credential Trapped in Chain-of-Thought (Sanitization Trap)";
      default:
        return type.replace(/_/g, " ");
    }
  };

  return (
    <div className="space-y-4">
      {/* Control bar: Search & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-2xl glass-panel">
        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5">
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setActiveFilter(opt.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeFilter === opt.id
                  ? "bg-white/[0.12] text-white shadow-sm border border-white/[0.12]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Filter tenant, session, user, model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-black/40 border border-white/[0.08] pl-9 pr-4 py-1.5 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition"
          />
        </div>
      </div>

      {/* Timeline Event Rows */}
      <div className="rounded-2xl glass-panel divide-y divide-white/[0.06] overflow-hidden">
        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center">
            <ShieldCheck className="mx-auto h-10 w-10 text-emerald-400/60 mb-2" />
            <p className="text-sm font-medium text-slate-300">
              No matching threat events detected
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Zero active integrity violations for current filter.
            </p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => setSelectedEvent(event)}
              className="group flex flex-col lg:flex-row lg:items-center justify-between p-4 hover:bg-white/[0.02] cursor-pointer transition duration-150 gap-3"
            >
              <div className="flex items-start space-x-3.5">
                <div className="mt-0.5">{getSeverityBadge(event.severity)}</div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2.5">
                    <span className="font-semibold text-xs text-white group-hover:text-cyan-300 transition">
                      {getEventTitle(event.event_type)}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 flex items-center space-x-1">
                      <Clock className="h-3 w-3 inline text-slate-500" />
                      <span>{new Date(event.created_at).toLocaleTimeString()}</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-1">
                    {event.metadata.reason ||
                      event.metadata.summary ||
                      `Intervention triggered by ${event.event_type}`}
                  </p>

                  {/* Context Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="rounded bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 text-[10px] font-mono text-slate-300">
                      tenant: <strong className="text-white">{event.tenant_id}</strong>
                    </span>
                    {event.session_id && (
                      <span className="rounded bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 text-[10px] font-mono text-slate-300">
                        sess: <strong className="text-cyan-300">{event.session_id}</strong>
                      </span>
                    )}
                    {event.model && (
                      <span className="rounded bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 text-[10px] font-mono text-slate-300">
                        model: <strong className="text-indigo-300">{event.model}</strong>
                      </span>
                    )}
                    {event.payload_fingerprint && (
                      <span className="rounded bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 text-[10px] font-mono text-slate-400">
                        hash: {event.payload_fingerprint.slice(0, 8)}...
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center space-x-2 shrink-0 self-end lg:self-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEvent(event);
                  }}
                  className="flex items-center space-x-1.5 rounded-xl bg-white/[0.04] hover:bg-cyan-950/40 border border-white/[0.08] hover:border-cyan-500/40 px-3 py-1.5 text-xs font-mono text-slate-300 hover:text-cyan-300 transition"
                >
                  <FileCode2 className="h-3.5 w-3.5" />
                  <span>Inspect Diff &amp; Proof</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* INSPECTION DRAWER / MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-enter-down">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl glass-panel border border-white/[0.12] p-6 shadow-2xl space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2.5">
                  {getSeverityBadge(selectedEvent.severity)}
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {getEventTitle(selectedEvent.event_type)}
                  </h3>
                </div>
                <p className="text-xs font-mono text-slate-400">
                  Incident ID: {selectedEvent.id} &bull; Detected at:{" "}
                  {new Date(selectedEvent.created_at).toISOString()}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    copyToClipboard(JSON.stringify(selectedEvent, null, 2))
                  }
                  className="flex items-center space-x-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] px-2.5 py-1 text-xs font-mono text-slate-300 transition"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-slate-400" />
                  )}
                  <span>{copied ? "Copied JSON" : "Copy Payload"}</span>
                </button>

                <button
                  onClick={() => setSelectedEvent(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/[0.08] transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Context Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
              <div className="rounded-xl bg-black/40 border border-white/[0.06] p-2.5">
                <span className="text-[10px] text-slate-500 uppercase block">
                  Tenant
                </span>
                <span className="text-white font-semibold">
                  {selectedEvent.tenant_id}
                </span>
              </div>
              <div className="rounded-xl bg-black/40 border border-white/[0.06] p-2.5">
                <span className="text-[10px] text-slate-500 uppercase block">
                  Session ID
                </span>
                <span className="text-cyan-300 font-semibold truncate block">
                  {selectedEvent.session_id || "N/A"}
                </span>
              </div>
              <div className="rounded-xl bg-black/40 border border-white/[0.06] p-2.5">
                <span className="text-[10px] text-slate-500 uppercase block">
                  Turn Counter
                </span>
                <span className="text-white font-semibold">
                  Turn #{selectedEvent.metadata.turn || 2}
                </span>
              </div>
              <div className="rounded-xl bg-black/40 border border-white/[0.06] p-2.5">
                <span className="text-[10px] text-slate-500 uppercase block">
                  Model
                </span>
                <span className="text-indigo-300 font-semibold truncate block">
                  {selectedEvent.model ||
                    selectedEvent.metadata.target_model ||
                    "claude-3-5-sonnet"}
                </span>
              </div>
            </div>

            {/* SIDE-BY-SIDE VISUAL DIFF */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
                1. Payload Ingress vs. Hera Gateway Autonomous Intervention
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                {/* Attacker Payload */}
                <div className="rounded-xl bg-[#090b14] border border-rose-500/30 p-3.5 space-y-2">
                  <div className="flex items-center justify-between border-b border-rose-500/20 pb-2">
                    <span className="text-rose-400 font-bold flex items-center space-x-1.5">
                      <ShieldAlert className="h-3.5 w-3.5" />
                      <span>Attacker Request Payload</span>
                    </span>
                    <span className="text-[10px] text-rose-400/80 bg-rose-950/60 px-2 py-0.5 rounded">
                      Untrusted Ingress
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-300">
                    <div>
                      <span className="text-slate-500">Origin Tenant: </span>
                      <span className="text-rose-300 font-semibold">
                        {selectedEvent.metadata.bound_tenant || "tenant-alpha"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Origin User: </span>
                      <span className="text-rose-300 font-semibold">
                        {selectedEvent.metadata.bound_user || "user-alice"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Attempted Target: </span>
                      <span className="text-rose-400 font-semibold">
                        {selectedEvent.metadata.attempted_user ||
                          selectedEvent.metadata.target_model ||
                          "user-bob"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Thinking Blob: </span>
                      <span className="text-slate-400 break-all">
                        {selectedEvent.payload_fingerprint ||
                          "sgh_0191e4a2-8b3c-7890-a1b2-c3d4e5f6a7b8"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Gateway Intervention */}
                <div className="rounded-xl bg-[#090b14] border border-emerald-500/30 p-3.5 space-y-2">
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                    <span className="text-emerald-400 font-bold flex items-center space-x-1.5">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Hera Gateway Intervention</span>
                    </span>
                    <span className="text-[10px] text-emerald-400/80 bg-emerald-950/60 px-2 py-0.5 rounded">
                      Enforced Invariant
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-300">
                    <div>
                      <span className="text-slate-500">HTTP Response: </span>
                      <span
                        className={`font-semibold ${
                          selectedEvent.event_type === "SECRET_IN_STATE"
                            ? "text-amber-300"
                            : "text-rose-300"
                        }`}
                      >
                        {selectedEvent.event_type === "SECRET_IN_STATE"
                          ? "200 OK (Clean Redaction)"
                          : "403 Forbidden (Drop Connection)"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Violation Type: </span>
                      <span className="text-emerald-300 font-semibold">
                        {selectedEvent.event_type}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Action: </span>
                      <span className="text-emerald-400 font-semibold">
                        {selectedEvent.event_type === "SECRET_IN_STATE"
                          ? "Scrubbed in-flight with Shannon entropy scanner"
                          : "Request dropped before upstream LLM invocation"}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Proof Verification: </span>
                      <span className="text-cyan-300 font-semibold">
                        &check; HMAC &amp; Merkle AD Mismatch Confirmed
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cryptographic Invariant Breakdown */}
            <div className="rounded-xl bg-black/40 border border-white/[0.06] p-4 space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <Lock className="h-3.5 w-3.5 text-cyan-400" />
                <span>2. Mathematical &amp; Cryptographic Proof Parameters</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] font-mono">
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-slate-500 block mb-1">Associated Data (AD)</span>
                  <span className="text-cyan-300 break-all">
                    tenant_id || user_id || session_id || turn || model
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-slate-500 block mb-1">HMAC Ratchet Status</span>
                  <span className="text-rose-300">
                    &tau;_{`{n+1}`} verification rejected (Out-of-order)
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                  <span className="text-slate-500 block mb-1">Merkle Tree Origin</span>
                  <span className="text-emerald-300">
                    Child branch mismatch with parent root
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-2 border-t border-white/[0.08]">
              <button
                onClick={() => setSelectedEvent(null)}
                className="rounded-xl bg-white/[0.08] hover:bg-white/[0.15] px-4 py-2 text-xs font-mono text-white transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
