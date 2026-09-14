"use client";

import React, { useState } from "react";
import { Copy, Check, Terminal } from "lucide-react";

interface CodeSnippetProps {
  code: string;
  language?: string;
  filename?: string;
}

export default function CodeSnippet({
  code,
  language = "bash",
  filename,
}: CodeSnippetProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-xl bg-black/80 border border-white/[0.08] overflow-hidden my-4 group">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06] bg-zinc-950/80 text-[11px] font-mono text-zinc-400">
        <div className="flex items-center space-x-2">
          <Terminal className="h-3 w-3 text-emerald-400" />
          <span>{filename || language}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 text-zinc-400 hover:text-white transition px-2 py-0.5 rounded hover:bg-zinc-800"
          title="Copy code"
        >
          {copied ? (
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

      {/* Code content */}
      <pre className="p-4 overflow-x-auto font-mono text-xs text-zinc-200 leading-relaxed selection:bg-emerald-500/20">
        <code>{code}</code>
      </pre>
    </div>
  );
}
