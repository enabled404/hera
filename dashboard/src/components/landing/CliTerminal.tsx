"use client";

import React, { useState } from "react";
import { Terminal, Play, Copy, Check, ShieldAlert, Sparkles, FileCode, ArrowRight } from "lucide-react";
import Link from "next/link";

interface CommandOption {
  id: string;
  name: string;
  cmd: string;
  output: string[];
}

const COMMANDS: CommandOption[] = [
  {
    id: "scan",
    name: "stateguard scan",
    cmd: "stateguard scan ./agent_trajectories/ --sarif report.sarif",
    output: [
      "[INFO] StateGuard Trajectory Scanner v1.1.0 (SIMD Aho-Corasick + Shannon H(X))",
      "[INFO] Scanning 48 agent trajectory logs in ./agent_trajectories/ ...",
      "",
      "⚠️  [CRITICAL] ./agent_trajectories/sess_alice_refactor.json:42",
      "    The Sanitization Trap Detected: Raw AWS Secret Key (AKIAIOSFODNN7EXAMPLE)",
      "    Trapped in unvaulted client-held reasoning envelope. Shannon H(X) = 4.41 bits.",
      "",
      "⚠️  [HIGH] ./agent_trajectories/sess_bob_trading.jsonl:108",
      "    Monotonic Sequence Violation: Turn 4 parent digest does not match Turn 3 HMAC ratchet.",
      "",
      "⚠️  [CRITICAL] ./agent_trajectories/sess_eval_haiku.json:19",
      "    Asymmetric Decryption Oracle: Claude 3.7 envelope replayed to Claude 3.5 Haiku endpoint.",
      "",
      "✓ [COMPLETED] 48 files inspected in 14.2ms (Zero False Positives).",
      "✓ [SARIF EXPORT] Vulnerabilities exported to report.sarif (GitHub Code Scanning format).",
    ],
  },
  {
    id: "verify",
    name: "stateguard verify",
    cmd: "stateguard verify --merkle-root e7b89f214c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f",
    output: [
      "[INFO] Verifying multi-turn Merkle Tree inclusion proofs across DAG...",
      "[INFO] Root Hash: e7b89f214c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0123456789abcdef01234567",
      "",
      "  Turn #0 (system):    3a91c890... [PASS - Root Origin Authenticated]",
      "  Turn #1 (user):      7f4c9a18... [PASS - Monotonic Ratchet Intact]",
      "  Turn #2 (assistant): 12d8a571... [PASS - Sub-agent Fork Point Authenticated]",
      "  Turn #3a (branch_a): 99c7b128... [PASS - Parent Link Validated]",
      "  Turn #3b (branch_b): a4f1e928... [PASS - Parent Link Validated]",
      "  Turn #4 (synthesis): e7b89f21... [PASS - Sibling Merkle Witness Verified]",
      "",
      "✓ [PROOF VALID] Merkle DAG Lineage verified. Zero bit flips or sequence rollbacks.",
    ],
  },
  {
    id: "migrate",
    name: "stateguard migrate",
    cmd: "stateguard migrate --input ./legacy_logs/ --output ./sanitized_logs/ --gateway http://127.0.0.1:8080",
    output: [
      "[INFO] Batch re-signing legacy transcripts with tenant-bound state handles...",
      "[INFO] Processing 124 historical session files...",
      "",
      "  -> Re-signing sess_2026_01.json: Stripped 38KB reasoning token -> Vaulted into sgh_018f3a9b",
      "  -> Re-signing sess_2026_02.json: Scrubbed 1 OpenAI key -> Masked to [REDACTED: API_KEY]",
      "  -> Re-signing sess_2026_03.json: Context bound to tenant:acme-corp:usr_alice",
      "",
      "✓ [MIGRATION COMPLETE] 124 files rewritten with zero plaintext secrets.",
      "✓ Generated migration audit trail in ./sanitized_logs/migration_report.json.",
    ],
  },
];

export default function CliTerminal() {
  const [selectedCmd, setSelectedCmd] = useState<CommandOption>(COMMANDS[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedCmd.cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-16 md:py-24 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-zinc-900 border border-white/[0.08] text-xs font-mono text-zinc-400">
            <Terminal className="h-3.5 w-3.5 text-emerald-400" />
            <span>Developer-First CLI Experience</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-sans">
            Audit Any Agent Trajectory in Under 15 Milliseconds
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 font-sans leading-relaxed">
            Run instant static security scans in your terminal or CI/CD pipelines. No Docker required—install
            via <code className="text-zinc-200 font-mono">npx</code> or single-file native Rust binary.
          </p>
        </div>

        {/* Interactive Terminal Sandbox */}
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/[0.12] max-w-5xl mx-auto shadow-2xl">
          {/* Chrome Bar */}
          <div className="px-4 py-3 bg-black/80 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1.5">
                <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block"></span>
                <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block"></span>
                <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block"></span>
              </div>
              <span className="text-xs font-mono text-zinc-400 pl-2 border-l border-white/[0.08]">
                stateguard-cli v1.1.0 &bull; Native Binary Terminal
              </span>
            </div>

            {/* Command Pills */}
            <div className="flex items-center space-x-1 p-1 rounded-lg bg-zinc-900/90 border border-white/[0.08] text-xs font-mono overflow-x-auto">
              {COMMANDS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCmd(c)}
                  className={`px-3 py-1 rounded transition whitespace-nowrap ${
                    selectedCmd.id === c.id
                      ? "bg-zinc-800 text-white font-medium border border-white/[0.1] shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Active Command Bar */}
          <div className="px-4 py-2.5 bg-zinc-950/90 border-b border-white/[0.04] flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-2 text-zinc-300 truncate">
              <span className="text-emerald-400 font-bold">$</span>
              <span className="truncate">{selectedCmd.cmd}</span>
            </div>
            <button
              onClick={handleCopy}
              className="text-zinc-400 hover:text-white flex items-center space-x-1 px-2 py-0.5 rounded hover:bg-zinc-850 shrink-0 ml-2"
              title="Copy command"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              <span className="text-[11px] hidden sm:inline">Copy</span>
            </button>
          </div>

          {/* Terminal Output */}
          <div className="p-5 bg-black/90 font-mono text-xs text-zinc-300 space-y-1 leading-relaxed overflow-x-auto max-h-80 select-all">
            {selectedCmd.output.map((line, i) => (
              <div
                key={i}
                className={
                  line.includes("[CRITICAL]")
                    ? "text-rose-400 font-medium"
                    : line.includes("[HIGH]")
                    ? "text-amber-400 font-medium"
                    : line.includes("✓")
                    ? "text-emerald-400 font-semibold"
                    : line.includes("[INFO]")
                    ? "text-zinc-500"
                    : "text-zinc-300"
                }
              >
                {line}
              </div>
            ))}
          </div>

          {/* Terminal Footer */}
          <div className="px-4 py-3 bg-zinc-950 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-zinc-400">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              <span>Available on Linux (x86_64/ARM64), macOS (Apple Silicon/Intel), and Windows.</span>
            </div>
            <Link
              href="/docs/cli-scanner"
              className="text-emerald-400 hover:text-emerald-300 transition flex items-center space-x-1"
            >
              <span>Read Full CLI Documentation &rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
