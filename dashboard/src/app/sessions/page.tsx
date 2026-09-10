"use client";

import React, { useState } from "react";

interface AgentSession {
  id: string;
  external_session_id: string;
  bound_user_id: string;
  model_family: string;
  current_turn: number;
  merkle_root: string;
  last_active: string;
}

const SAMPLE_SESSIONS: AgentSession[] = [
  {
    id: "s-1",
    external_session_id: "agent-pipeline-prod-01",
    bound_user_id: "usr_alice_corp",
    model_family: "anthropic-claude",
    current_turn: 8,
    merkle_root: "9f83a21b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0123456789abcdef01234567",
    last_active: "1 minute ago",
  },
  {
    id: "s-2",
    external_session_id: "refactor-worker-99",
    bound_user_id: "usr_bob_dev",
    model_family: "openai-gpt5",
    current_turn: 3,
    merkle_root: "b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2",
    last_active: "4 minutes ago",
  },
  {
    id: "s-3",
    external_session_id: "code-review-bot-22",
    bound_user_id: "usr_ci_system",
    model_family: "google-gemini",
    current_turn: 14,
    merkle_root: "e3f4a5b6c7d8e9f0123456789abcdef0123456789f83a21b4c5d6e7f8a9b0c1d",
    last_active: "12 minutes ago",
  },
];

export default function SessionAuditPage() {
  const [selectedSession, setSelectedSession] = useState<AgentSession>(
    SAMPLE_SESSIONS[0]
  );
  const [auditVerified, setAuditVerified] = useState<boolean>(true);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          Session Explorer & Merkle Tree Compaction Audit
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Cryptographically verify turn ordinality invariant ($P_1$) and Merkle subtree audit proofs across conversational turns.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions List */}
        <div className="lg:col-span-1 bg-[#0c101c] border border-slate-800 rounded-xl overflow-hidden shadow">
          <div className="p-4 border-b border-slate-800 text-xs font-mono font-semibold text-slate-300 uppercase">
            Active Bound Sessions
          </div>
          <div className="divide-y divide-slate-800/70">
            {SAMPLE_SESSIONS.map((sess) => (
              <button
                key={sess.id}
                onClick={() => setSelectedSession(sess)}
                className={`w-full text-left p-4 transition ${
                  selectedSession.id === sess.id
                    ? "bg-indigo-950/40 border-l-2 border-indigo-500"
                    : "hover:bg-slate-800/30"
                }`}
              >
                <div className="font-mono text-xs font-semibold text-slate-200 truncate">
                  {sess.external_session_id}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mt-1.5">
                  <span>User: {sess.bound_user_id}</span>
                  <span className="text-indigo-400">Turn #{sess.current_turn}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Merkle Visualizer */}
        <div className="lg:col-span-2 bg-[#0c101c] border border-slate-800 rounded-xl p-6 space-y-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white font-mono">
                Merkle State Verification: {selectedSession.external_session_id}
              </h2>
              <div className="text-xs text-slate-400 mt-0.5 font-mono">
                Current Monotonic Turn: {selectedSession.current_turn} &bull; Model: {selectedSession.model_family}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {auditVerified ? (
                <span className="px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
                  ✓ Merkle Root Validated
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-mono">
                  ✗ Tampering Detected
                </span>
              )}
            </div>
          </div>

          <div className="bg-[#070a12] border border-slate-800/80 rounded-lg p-4 font-mono text-xs space-y-2">
            <div className="text-slate-500">Stored Merkle Root Hash:</div>
            <div className="text-indigo-300 break-all bg-slate-900/60 p-2 rounded border border-slate-800">
              {selectedSession.merkle_root}
            </div>
          </div>

          {/* Merkle Tree Diagram */}
          <div className="space-y-4">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
              Compacted Trajectory Merkle Subtree
            </div>
            <div className="grid grid-cols-4 gap-2 text-center font-mono text-[11px]">
              <div className="p-3 bg-slate-900/80 border border-slate-800/70 rounded text-slate-500">
                <div>Turn 1-4</div>
                <div className="text-[9px] text-slate-600 mt-1">[PRUNED / COMPACTED]</div>
              </div>
              <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded text-indigo-300">
                <div>Turn 5</div>
                <div className="text-[9px] text-emerald-400 mt-1">Verified Leaf</div>
              </div>
              <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded text-indigo-300">
                <div>Turn 6</div>
                <div className="text-[9px] text-emerald-400 mt-1">Verified Leaf</div>
              </div>
              <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded text-indigo-300">
                <div>Turn {selectedSession.current_turn}</div>
                <div className="text-[9px] text-emerald-400 mt-1">Active Head</div>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              When conversation histories are pruned or compacted, StateGuard validates surviving subtrees against the stored root without recomputing intermediate states.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
