"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbProps {
  category: string;
  currentPage: string;
}

export default function DocsBreadcrumb({ category, currentPage }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-xs font-mono text-zinc-400 pb-4 border-b border-white/[0.06] mb-6">
      <Link href="/" className="hover:text-white transition flex items-center space-x-1">
        <Home className="h-3 w-3" />
        <span>Hera</span>
      </Link>
      <ChevronRight className="h-3 w-3 text-zinc-600" />
      <Link href="/docs" className="hover:text-white transition">
        Docs
      </Link>
      <ChevronRight className="h-3 w-3 text-zinc-600" />
      <span className="text-zinc-500">{category}</span>
      <ChevronRight className="h-3 w-3 text-zinc-600" />
      <span className="text-zinc-200 font-medium">{currentPage}</span>
    </nav>
  );
}
