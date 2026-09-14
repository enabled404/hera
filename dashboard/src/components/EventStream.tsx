"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  ChevronRight,
  X,
  Copy,
  Check,
  Clock,
  Lock,
  ArrowRight,
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

  // Compute counts for filter pills
  const counts = {
    all: events.length,
    replays: events.filter((e) => e.event_type === "CROSS_USER_REPLAY").length,
    downgrades: events.filter((e) => e.event_type === "MODEL_MISMATCH").length,
    redactions: events.filter((e) => e.event_type === "SECRET_IN_STATE").length,
  };

  const filterOptions = [
    { id: "ALL", label: `All (${counts.all})` },
    { id: "CROSS_USER_REPLAY", label: `Replays (${counts.replays})` },
    { id: "MODEL_MISMATCH", label: `Downgrades (${counts.downgrades})` },
    { id: "SECRET_IN_STATE", label: `Redactions (${counts.redactions})` },
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

  const getStatusPill = (eventType: string) => {
    switch (eventType) {
      case "CROSS_USER_REPLAY":
        return (
          <span className="inline-flex items-center space-x-1 rounded-md bg-rose-950/60 border border-rose-500/30 px-2 py-0.5 text-[10px] font-mono font-semibold text-rose-300">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
            <span>403 FORBIDDEN</span>
          </span>
        );
      case "MODEL_MISMATCH":
        return (
          <span className="inline-flex items-center space-x-1 rounded-md bg-rose-950/60 border border-rose-500/30 px-2 py-0.5 text-[10px] font-mono font-semibold text-rose-300">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            <span>403 FORBIDDEN</span>
          </span>
        );
      case "SECRET_IN_STATE":
        return (
          <span className="inline-flex items-center space-x-1 rounded-md bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 text-[10px] font-mono font-semibold text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span>200 SANITIZED</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 rounded-md bg-zinc-800 border border-white/[0.08] px-2 py-0.5 text-[10px] font-mono text-zinc-300">
            <span>200 OK</span>
          </span>
        );
    }
  };

  const getEventTitle = (type: string) => {
    switch (type) {
      case "CROSS_USER_REPLAY":
        return "Cross-User Signature Replay Attack";
      case "MODEL_MISMATCH":
        return "Model Lineage Downgrade Attempt";
      case "SECRET_IN_STATE":
        return "Secret Trapped in Chain-of-Thought (Scrubbed)";
      default:
        return type.replace(/_/g, " ");
    }
  };

  const getInvariantText = (evt: SecurityEvent) => {
    if (evt.event_type === "CROSS_USER_REPLAY") {
      return "Associated Data mismatch: user_id 'user-alice' != 'user-bob'";
    } else if (evt.event_type === "MODEL_MISMATCH") {
      return "Lineage violation: down-tier transplant (Opus -> Haiku)";
    } else if (evt.event_type === "SECRET_IN_STATE") {
      return "Shannon entropy H(X) >= 4.2: inline credential redacted";
    }
    return evt.metadata.reason || "Integrity verification enforced";
  };

  return (
    <div className="space-y-3">
      {/* Header & Controls */}
      <div className="glass-panel rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setActiveFilter(opt.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                activeFilter === opt.id
                  ? "bg-zinc-800 text-white border border-white/[0.1] shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Search & Reset */}
        <div className="flex items-center space-x-2">
          <div className="relative min-w-[200px] sm:min-w-[240px]">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search session, tenant, model..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg bg-black/40 border border-white/[0.08] pl-8 pr-3 py-1 text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 transition"
            />
          </div>

          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs font-mono text-zinc-400 hover:text-white px-2 py-1 rounded bg-zinc-800/60 border border-white/[0.06]"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Log Stream Items */}
      <div className="space-y-1.5">
        {filteredEvents.length === 0 ? (
          <div className="glass-panel rounded-xl p-8 text-center">
            <ShieldCheck className="mx-auto h-8 w-8 text-emerald-400/60 mb-2" />
            <p className="text-sm font-medium text-zinc-300">
              No matching security events
            </p>
            <p className="text-xs text-zinc-500 mt-1 font-mono">
              Zero active integrity violations matching the current filter.
            </p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => setSelectedEvent(event)}
              className="bg-zinc-950/40 border border-white/[0.04] hover:border-white/[0.1] rounded-lg p-3 sm:p-3.5 flex flex-col md:flex-row md:items-center justify-between transition-all group gap-2 cursor-pointer"
            >
              {/* Left Zone: Status pill, attack label, timestamp, session ID */}
              <div className="flex items-center space-x-2.5 min-w-0">
                {getStatusPill(event.event_type)}

                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 min-w-0">
                  <span className="text-xs font-medium text-white group-hover:text-zinc-200 transition font-sans truncate">
                    {getEventTitle(event.event_type)}
                  </span>
                  <div className="flex items-center space-x-1.5 text-[11px] font-mono text-zinc-500">
                    <span className="hidden sm:inline">&middot;</span>
                    <span>{new Date(event.created_at).toLocaleTimeString()}</span>
                    {event.session_id && (
                      <>
                        <span>&middot;</span>
                        <span className="text-zinc-400 truncate max-w-[120px]">
                          {event.session_id}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Middle Zone: Invariant Violated */}
              <div className="hidden lg:block text-xs font-mono text-zinc-400 truncate max-w-sm px-2">
                {getInvariantText(event)}
              </div>

              {/* Right Zone: Inspect Action */}
              <div className="flex items-center space-x-2 shrink-0 self-end md:self-auto">
                <span className="inline-flex items-center space-x-1 text-xs font-mono text-zinc-400 group-hover:text-white transition">
                  <span>Inspect Diff</span>
                  <ArrowRight className="h-3 w-3 text-zinc-500 group-hover:text-white transition group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* INSPECTION MODAL / DRAWER */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-enter-down">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl glass-panel border border-white/[0.12] p-5 sm:p-6 shadow-2xl space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5">
              <div className="space-y-1">
                <div className="flex items-center space-x-2.5">
                  {getStatusPill(selectedEvent.event_type)}
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight font-sans">
                    {getEventTitle(selectedEvent.event_type)}
                  </h3>
                </div>
                <p className="text-xs font-mono text-zinc-400">
                  Event ID: {selectedEvent.id} &bull; Timestamp:{" "}
                  {new Date(selectedEvent.created_at).toISOString()}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    copyToClipboard(JSON.stringify(selectedEvent, null, 2))
                  }
                  className="flex items-center space-x-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 border border-white/[0.08] px-2.5 py-1 text-xs font-mono text-zinc-300 transition"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-zinc-400" />
                  )}
                  <span>{copied ? "Copied" : "Copy JSON"}</span>
                </button>

                <button
                  onClick={() => setSelectedEvent(null)}
                  className="rounded-lg p-1 text-zinc-400 hover:text-white hover:bg-white/[0.08] transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Context Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
              <div className="rounded-xl bg-black/40 border border-white/[0.06] p-2.5">
                <span className="text-[10px] text-zinc-500 uppercase block">Tenant</span>
                <span className="text-white font-semibold">{selectedEvent.tenant_id}</span>
              </div>
              <div className="rounded-xl bg-black/40 border border-white/[0.06] p-2.5">
                <span className="text-[10px] text-zinc-500 uppercase block">Session ID</span>
                <span className="text-zinc-200 font-semibold truncate block">
                  {selectedEvent.session_id || "N/A"}
                </span>
              </div>
              <div className="rounded-xl bg-black/40 border border-white/[0.06] p-2.5">
                <span className="text-[10px] text-zinc-500 uppercase block">Turn Counter</span>
                <span className="text-white font-semibold">
                  Turn #{selectedEvent.metadata.turn || 2}
                </span>
              </div>
              <div className="rounded-xl bg-black/40 border border-white/[0.06] p-2.5">
                <span className="text-[10px] text-zinc-500 uppercase block">Model Target</span>
                <span className="text-zinc-200 font-semibold truncate block">
                  {selectedEvent.model || selectedEvent.metadata.target_model || "claude-3-5-sonnet"}
                </span>
              </div>
            </div>

            {/* Side-by-Side Payload Comparison (Before vs After) */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                1. Inbound Malicious Payload (Before) vs. Gateway Defense Action (After)
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                {/* Attacker Payload (Before) */}
                <div className="rounded-xl bg-[#09090c] border border-rose-500/30 p-3.5 space-y-2">
                  <div className="flex items-center justify-between border-b border-rose-500/20 pb-2">
                    <span className="text-rose-400 font-bold flex items-center space-x-1.5">
                      <ShieldAlert className="h-3.5 w-3.5" />
                      <span>Inbound Malicious Payload</span>
                    </span>
                    <span className="text-[10px] text-rose-400/80 bg-rose-950/60 px-2 py-0.5 rounded">
                      Untrusted Ingress
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px] text-zinc-300">
                    <div>
                      <span className="text-zinc-500">Origin Tenant: </span>
                      <span className="text-rose-300 font-semibold">
                        {selectedEvent.metadata.bound_tenant || "tenant-alpha"}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Origin User: </span>
                      <span className="text-rose-300 font-semibold">
                        {selectedEvent.metadata.bound_user || "user-alice"}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Attempted Target: </span>
                      <span className="text-rose-400 font-semibold">
                        {selectedEvent.metadata.attempted_user || selectedEvent.metadata.target_model || "user-bob"}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Thinking Signature: </span>
                      <span className="text-zinc-400 break-all">
                        {selectedEvent.payload_fingerprint || "sgh_0191e4a2-8b3c-7890-a1b2-c3d4e5f6a7b8"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Gateway Defense Action (After) */}
                <div className="rounded-xl bg-[#09090c] border border-emerald-500/30 p-3.5 space-y-2">
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                    <span className="text-emerald-400 font-bold flex items-center space-x-1.5">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Gateway Defense Action</span>
                    </span>
                    <span className="text-[10px] text-emerald-400/80 bg-emerald-950/60 px-2 py-0.5 rounded">
                      Enforced Invariant
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px] text-zinc-300">
                    <div>
                      <span className="text-zinc-500">HTTP Verdict: </span>
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
                      <span className="text-zinc-500">Action: </span>
                      <span className="text-emerald-400 font-semibold">
                        {selectedEvent.event_type === "SECRET_IN_STATE"
                          ? "Scrubbed in-flight before APM export"
                          : "Dropped at ingress; zero bytes forwarded upstream"}
                      </span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Invariant: </span>
                      <span className="text-zinc-200 font-semibold">
                        {getInvariantText(selectedEvent)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cryptographic Proof Attributes */}
            <div className="rounded-xl bg-black/40 border border-white/[0.06] p-4 space-y-2.5">
              <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center space-x-1.5">
                <Lock className="h-3.5 w-3.5 text-emerald-400" />
                <span>2. Cryptographic Proof Attributes</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 text-[11px] font-mono">
                <div className="p-2 rounded-lg bg-zinc-900/60 border border-white/[0.04]">
                  <span className="text-zinc-500 block mb-0.5">Tenant Key ID</span>
                  <span className="text-zinc-200">k_prod_89012a</span>
                </div>
                <div className="p-2 rounded-lg bg-zinc-900/60 border border-white/[0.04]">
                  <span className="text-zinc-500 block mb-0.5">Expected AD Hash</span>
                  <span className="text-emerald-400 truncate block">0x9f83a21b4c...</span>
                </div>
                <div className="p-2 rounded-lg bg-zinc-900/60 border border-white/[0.04]">
                  <span className="text-zinc-500 block mb-0.5">Received AD Hash</span>
                  <span className="text-rose-400 truncate block">0x1122a4f910...</span>
                </div>
                <div className="p-2 rounded-lg bg-zinc-900/60 border border-white/[0.04]">
                  <span className="text-zinc-500 block mb-0.5">Sequence Ordinality</span>
                  <span className="text-zinc-300">Turn #2 (Monotonic)</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-2 border-t border-white/[0.08]">
              <button
                onClick={() => setSelectedEvent(null)}
                className="rounded-lg bg-zinc-800 hover:bg-zinc-700 px-4 py-1.5 text-xs font-mono text-white transition"
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

