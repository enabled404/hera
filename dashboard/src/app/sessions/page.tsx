"use client";

import React, { useState } from "react";
import {
  Layers,
  GitBranch,
  GitFork,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  RefreshCw,
  Fingerprint,
  Terminal,
  Lock,
} from "lucide-react";

interface DAGNode {
  id: string;
  turn: number;
  branch: string;
  role: "system" | "user" | "assistant" | "subagent";
  title: string;
  hash: string;
  parentHash: string;
  merklePath: string[];
  tokens: number;
  latencyMs: number;
  timestamp: string;
  status: "verified" | "forked" | "tampered";
}

interface AgentSession {
  id: string;
  name: string;
  tenantId: string;
  boundUserId: string;
  modelFamily: string;
  headTurn: number;
  merkleRoot: string;
  lastActive: string;
  nodes: DAGNode[];
}

const INITIAL_SESSIONS: AgentSession[] = [
  {
    id: "sess_prod_01",
    name: "agent-dag-pipeline-prod",
    tenantId: "acme-corp-prod",
    boundUserId: "usr_alice_architect",
    modelFamily: "claude-3-7-sonnet",
    headTurn: 5,
    merkleRoot: "e7b89f214c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0123456789abcdef01234567",
    lastActive: "Just now",
    nodes: [
      {
        id: "node_0",
        turn: 0,
        branch: "main",
        role: "system",
        title: "Session Initialization & Zero-Trust Envelope",
        hash: "3a91c890123456789abcdef0123456789abcdef0123456789abcdef012345678",
        parentHash: "0000000000000000000000000000000000000000000000000000000000000000",
        merklePath: ["e1f2...", "a9b8..."],
        tokens: 342,
        latencyMs: 1.2,
        timestamp: "19:24:01.102",
        status: "verified",
      },
      {
        id: "node_1",
        turn: 1,
        branch: "main",
        role: "user",
        title: "Codebase Security Audit Directive",
        hash: "7f4c9a1823746192847561029384756102938475610293847561029384756102",
        parentHash: "3a91c890123456789abcdef0123456789abcdef0123456789abcdef012345678",
        merklePath: ["8b7c...", "2d3e..."],
        tokens: 890,
        latencyMs: 1.8,
        timestamp: "19:24:02.415",
        status: "verified",
      },
      {
        id: "node_2",
        turn: 2,
        branch: "main",
        role: "assistant",
        title: "Orchestrator: DAG Decomposition & Fork",
        hash: "12d8a57162839405162738495061728394051627384950617283940516273849",
        parentHash: "7f4c9a1823746192847561029384756102938475610293847561029384756102",
        merklePath: ["4f5e...", "6a7b..."],
        tokens: 1420,
        latencyMs: 3.1,
        timestamp: "19:24:04.990",
        status: "verified",
      },
      {
        id: "node_3a",
        turn: 3,
        branch: "branch_alpha",
        role: "subagent",
        title: "Sub-agent Alpha: Static AST Analyzer",
        hash: "99c7b12847561029384756102938475610293847561029384756102938475610",
        parentHash: "12d8a57162839405162738495061728394051627384950617283940516273849",
        merklePath: ["7a8b...", "3c4d..."],
        tokens: 2840,
        latencyMs: 2.4,
        timestamp: "19:24:06.120",
        status: "verified",
      },
      {
        id: "node_3b",
        turn: 3,
        branch: "branch_beta",
        role: "subagent",
        title: "Sub-agent Beta: Dependency CVE Scanner",
        hash: "a4f1e92837465019283746501928374650192837465019283746501928374650",
        parentHash: "12d8a57162839405162738495061728394051627384950617283940516273849",
        merklePath: ["1c2d...", "9e0f..."],
        tokens: 3105,
        latencyMs: 2.7,
        timestamp: "19:24:06.180",
        status: "verified",
      },
      {
        id: "node_4",
        turn: 4,
        branch: "main",
        role: "assistant",
        title: "Synthesis: Sub-agent Evidence Merged",
        hash: "e7b89f214c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0123456789abcdef01234567",
        parentHash: "99c7b12847561029384756102938475610293847561029384756102938475610",
        merklePath: ["ROOT"],
        tokens: 4210,
        latencyMs: 4.2,
        timestamp: "19:24:09.300",
        status: "verified",
      },
    ],
  },
  {
    id: "sess_prod_02",
    name: "swe-agent-autonomous-refactor",
    tenantId: "fintech-cloud-sec",
    boundUserId: "usr_bob_devsecops",
    modelFamily: "gpt-4o-reasoning",
    headTurn: 3,
    merkleRoot: "b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2",
    lastActive: "4m ago",
    nodes: [
      {
        id: "node_r0",
        turn: 0,
        branch: "main",
        role: "system",
        title: "Enterprise Vault Policy Initialized",
        hash: "b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2",
        parentHash: "0000000000000000000000000000000000000000000000000000000000000000",
        merklePath: ["ROOT"],
        tokens: 512,
        latencyMs: 0.9,
        timestamp: "19:20:12.010",
        status: "verified",
      },
      {
        id: "node_r1",
        turn: 1,
        branch: "main",
        role: "user",
        title: "Refactor Authentication Handler",
        hash: "55a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f012",
        parentHash: "b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2",
        merklePath: ["7a8b..."],
        tokens: 1120,
        latencyMs: 1.5,
        timestamp: "19:20:15.220",
        status: "verified",
      },
    ],
  },
];

export default function SessionAuditPage() {
  const [sessions, setSessions] = useState<AgentSession[]>(INITIAL_SESSIONS);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("sess_prod_01");
  const [selectedNodeId, setSelectedNodeId] = useState<string>("node_3a");
  const [copiedRoot, setCopiedRoot] = useState<boolean>(false);
  const [isTampered, setIsTampered] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifySuccess, setVerifySuccess] = useState<boolean | null>(null);

  const currentSession = sessions.find((s) => s.id === selectedSessionId) || sessions[0];
  const currentNode = currentSession.nodes.find((n) => n.id === selectedNodeId) || currentSession.nodes[0];

  const handleCopyRoot = () => {
    navigator.clipboard.writeText(currentSession.merkleRoot);
    setCopiedRoot(true);
    setTimeout(() => setCopiedRoot(false), 2000);
  };

  const handleVerifyTree = () => {
    setIsVerifying(true);
    setVerifySuccess(null);
    setTimeout(() => {
      setIsVerifying(false);
      setVerifySuccess(!isTampered);
    }, 450);
  };

  const handleToggleTamper = () => {
    const nextTamper = !isTampered;
    setIsTampered(nextTamper);
    setVerifySuccess(null);

    // Update the selected node's status
    setSessions((prev) =>
      prev.map((sess) => {
        if (sess.id !== currentSession.id) return sess;
        return {
          ...sess,
          nodes: sess.nodes.map((node) => {
            if (node.id === selectedNodeId) {
              return {
                ...node,
                status: nextTamper ? "tampered" : "verified",
              };
            }
            return node;
          }),
        };
      })
    );
  };

  const handleForkBranchGamma = () => {
    const newNode: DAGNode = {
      id: `node_3c_${Date.now().toString().slice(-4)}`,
      turn: 3,
      branch: "branch_gamma",
      role: "subagent",
      title: "Sub-agent Gamma: Compliance & RegGuard",
      hash: "cc7a1928374650192837465019283746501928374650192837465019283746ff",
      parentHash: "12d8a57162839405162738495061728394051627384950617283940516273849",
      merklePath: ["3f4e...", "8a9b..."],
      tokens: 1890,
      latencyMs: 1.9,
      timestamp: new Date().toLocaleTimeString(),
      status: "forked",
    };

    setSessions((prev) =>
      prev.map((sess) => {
        if (sess.id !== currentSession.id) return sess;
        return {
          ...sess,
          nodes: [...sess.nodes, newNode],
        };
      })
    );
    setSelectedNodeId(newNode.id);
  };

  return (
    <div className="space-y-8 animate-enter-down">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-semibold">
              DAG &amp; Merkle Lineage Auditor
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans mt-1">
            Agent Tree-of-Thought &amp; Merkle State
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5 max-w-2xl font-sans">
            Audit turn monotonic ordinality, parallel sub-agent branching, and subtree Merkle inclusion proofs in real-time.
          </p>
        </div>

        {/* Global Verification Actions */}
        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          <button
            onClick={handleForkBranchGamma}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.08] text-xs font-mono text-zinc-300 hover:text-white transition"
          >
            <GitBranch className="h-3 w-3 text-zinc-400" />
            <span>+ Fork Sub-agent</span>
          </button>

          <button
            onClick={handleVerifyTree}
            disabled={isVerifying}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 font-sans font-medium text-xs text-black transition active:scale-[0.99] disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${isVerifying ? "animate-spin" : ""}`} />
            <span>Verify Merkle State</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Sessions / Center Visual DAG / Right Node Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Session Selector (3 cols) */}
        <div className="lg:col-span-3 space-y-3">
          <div className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>Bound Sessions ({sessions.length})</span>
            <span className="text-[10px] text-emerald-400 font-mono">Zero-Trust</span>
          </div>

          <div className="space-y-2">
            {sessions.map((sess) => {
              const isSelected = sess.id === currentSession.id;
              return (
                <div
                  key={sess.id}
                  onClick={() => {
                    setSelectedSessionId(sess.id);
                    setSelectedNodeId(sess.nodes[0].id);
                    setIsTampered(false);
                    setVerifySuccess(null);
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-zinc-900/90 border-emerald-500/40 shadow-sm"
                      : "bg-[#0c0c0e]/60 border-white/[0.06] hover:border-white/[0.12] hover:bg-zinc-900/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-white truncate">
                      {sess.name}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-300 bg-zinc-800 px-1.5 py-0.5 rounded border border-white/[0.06]">
                      T#{sess.headTurn}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 font-mono mt-1.5 truncate">
                    User: <span className="text-zinc-200">{sess.boundUserId}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono mt-1">
                    <span>{sess.modelFamily}</span>
                    <span>{sess.lastActive}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Root Merkle Box */}
          <div className="glass-card rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 flex items-center">
                <Fingerprint className="mr-1.5 h-3.5 w-3.5 text-zinc-400" />
                Root Merkle Digest
              </span>
              <button
                onClick={handleCopyRoot}
                className="text-[10px] font-mono text-zinc-400 hover:text-white flex items-center space-x-1"
                title="Copy Merkle Root"
              >
                {copiedRoot ? (
                  <>
                    <Check className="h-3 w-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="font-mono text-[11px] text-zinc-300 break-all bg-black/50 p-2.5 rounded-lg border border-white/[0.06] leading-relaxed select-all">
              {currentSession.merkleRoot}
            </div>
            <div className="text-[10px] text-zinc-500 font-mono flex items-center space-x-1">
              <Lock className="h-3 w-3 text-emerald-400" />
              <span>Immutable cryptographic anchor</span>
            </div>
          </div>
        </div>

        {/* Center Column: Visual DAG Flow (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider flex items-center space-x-2">
              <Layers className="h-3.5 w-3.5 text-zinc-400" />
              <span>Merkle State DAG Nodes</span>
            </div>

            {verifySuccess !== null && (
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded flex items-center space-x-1 ${
                  verifySuccess
                    ? "bg-emerald-950/50 border border-emerald-500/40 text-emerald-300"
                    : "bg-rose-950/50 border border-rose-500/40 text-rose-300"
                }`}
              >
                {verifySuccess ? (
                  <>
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 mr-1" />
                    <span>Inclusion Proof Verified</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="h-3.5 w-3.5 text-rose-400 mr-1" />
                    <span>Digest Mismatch Alert</span>
                  </>
                )}
              </span>
            )}
          </div>

          {/* Node Flow Visualizer */}
          <div className="glass-panel rounded-xl p-4 space-y-3 relative overflow-hidden">
            <div className="text-[11px] text-zinc-400 font-mono">
              Click any turn or sub-agent branch to inspect cryptographic state and witness path.
            </div>

            <div className="space-y-2.5">
              {currentSession.nodes.map((node) => {
                const isSelected = node.id === selectedNodeId;
                const isForked = node.branch !== "main";

                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`relative p-3 rounded-lg border transition-all cursor-pointer ${
                      isForked ? "ml-5 border-l-2 border-l-zinc-600" : ""
                    } ${
                      isSelected
                        ? "bg-zinc-900 border-white/[0.2] shadow-sm"
                        : "bg-black/40 border-white/[0.05] hover:border-white/[0.12] hover:bg-zinc-900/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {isForked ? (
                          <GitBranch className="h-3 w-3 text-zinc-400" />
                        ) : (
                          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                        )}
                        <span className="font-mono text-xs font-semibold text-white">
                          Turn #{node.turn}
                        </span>
                        {isForked && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-white/[0.06]">
                            {node.branch}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono text-zinc-500">
                          {node.tokens} tok
                        </span>
                        {node.status === "tampered" ? (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-950/60 border border-rose-500/40 text-rose-300">
                            TAMPERED
                          </span>
                        ) : node.status === "forked" ? (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 border border-white/[0.08] text-zinc-300">
                            FORKED
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-400">
                            VERIFIED
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-zinc-300 font-sans mt-1 font-medium">
                      {node.title}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono mt-1.5">
                      <span className="truncate max-w-[200px]">
                        hash: {node.hash.slice(0, 16)}...
                      </span>
                      <span>{node.latencyMs}ms</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Node Inspector & Witness Proof (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <Terminal className="h-3.5 w-3.5 text-zinc-400" />
              <span>Cryptographic Proof Witness</span>
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">{currentNode.id}</span>
          </div>

          <div className="glass-panel rounded-xl p-4.5 space-y-3.5">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white font-mono">
                  Turn #{currentNode.turn} ({currentNode.branch})
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  {currentNode.timestamp}
                </span>
              </div>
              <p className="text-xs text-zinc-300 mt-1 font-sans">
                {currentNode.title}
              </p>
            </div>

            {/* Context Binding Parameters */}
            <div className="bg-black/50 border border-white/[0.06] rounded-lg p-3 space-y-2 font-mono text-[11px]">
              <div className="text-zinc-500 text-[10px] uppercase tracking-wider font-semibold">
                Contextual Binding Tuple
              </div>
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <div className="text-zinc-400">Tenant:</div>
                <div className="text-zinc-200 truncate">{currentSession.tenantId}</div>
                <div className="text-zinc-400">Bound User:</div>
                <div className="text-zinc-200 truncate">{currentSession.boundUserId}</div>
                <div className="text-zinc-400">Branch ID:</div>
                <div className="text-zinc-200 font-semibold">{currentNode.branch}</div>
                <div className="text-zinc-400">Role:</div>
                <div className="text-zinc-200">{currentNode.role}</div>
              </div>
            </div>

            {/* Node Hash & Parent Link */}
            <div className="space-y-2">
              <div className="text-[11px] font-mono text-zinc-400">
                State Digest (H_t):
              </div>
              <div className="font-mono text-[10px] text-zinc-300 bg-black/60 p-2 rounded border border-white/[0.08] break-all">
                {currentNode.hash}
              </div>

              <div className="text-[11px] font-mono text-zinc-400 pt-0.5">
                Parent Link (H_t-1):
              </div>
              <div className="font-mono text-[10px] text-zinc-400 bg-black/60 p-2 rounded border border-white/[0.08] break-all">
                {currentNode.parentHash}
              </div>
            </div>

            {/* Merkle Inclusion Witness */}
            <div className="space-y-1.5 pt-0.5">
              <div className="text-[11px] font-mono text-zinc-400 flex items-center justify-between">
                <span>Merkle Witness Siblings:</span>
                <span className="text-[10px] text-emerald-400 font-mono">HMAC-SHA256</span>
              </div>
              <div className="space-y-1">
                {currentNode.merklePath.map((sibling, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-1.5 rounded bg-zinc-950/60 border border-white/[0.05] text-[10px] font-mono"
                  >
                    <span className="text-zinc-500">Level {i} Witness</span>
                    <span className="text-zinc-300 font-medium">{sibling}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tamper / Rollback Simulation Action */}
            <div className="pt-3 border-t border-white/[0.08] space-y-2">
              <div className="text-[10px] font-mono text-zinc-500">
                Adversarial Proof Testing:
              </div>
              <button
                onClick={handleToggleTamper}
                className={`w-full py-2 px-3 rounded-lg text-xs font-mono font-medium transition-all ${
                  isTampered
                    ? "bg-rose-950/60 border border-rose-500/50 text-rose-300 hover:bg-rose-900/60"
                    : "bg-zinc-800/80 hover:bg-zinc-700/80 border border-white/[0.08] text-zinc-300 hover:text-white"
                }`}
              >
                {isTampered ? "Revert Simulated Mutation" : "Simulate Node Tampering (Bit Flip)"}
              </button>

              {isTampered && (
                <div className="p-2.5 rounded bg-rose-950/40 border border-rose-500/30 text-[10px] font-mono text-rose-300 leading-relaxed">
                  [SECURITY INTERVENTION] Merkle root mismatch detected. Gateway dropped response and triggered state invalidation.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

