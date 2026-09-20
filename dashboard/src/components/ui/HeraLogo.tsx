"use client";

import React, { useId } from "react";

interface HeraLogoProps {
  size?: number;
  className?: string;
  glow?: boolean;
}

export default function HeraLogo({
  size = 28,
  className = "",
  glow = false,
}: HeraLogoProps) {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9]/g, "_");

  const auraId = `heraAura_${uid}`;
  const strokeId = `heraStroke_${uid}`;
  const spineLId = `heraSpineL_${uid}`;
  const spineRId = `heraSpineR_${uid}`;
  const bridgeId = `heraBridge_${uid}`;
  const nexusId = `heraNexus_${uid}`;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {glow && (
        <div
          className="absolute inset-0 rounded-xl bg-emerald-500/20 blur-md pointer-events-none transform scale-125 transition-opacity duration-300"
          aria-hidden="true"
        />
      )}
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 select-none transform transition-transform duration-300 hover:scale-105"
        aria-label="Hera StateGuard Logo"
      >
        <defs>
          {/* Ambient Radial Bloom */}
          <radialGradient id={auraId} cx="16" cy="16" r="14" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#050507" stopOpacity="0" />
          </radialGradient>

          {/* Enclave Perimeter Stroke Gradient */}
          <linearGradient id={strokeId} x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="35%" stopColor="#10b981" stopOpacity="0.6" />
            <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
          </linearGradient>

          {/* Left Vertical Spine Laser Bus */}
          <linearGradient id={spineLId} x1="8.5" y1="5" x2="8.5" y2="27" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#a7f3d0" />
            <stop offset="60%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>

          {/* Right Vertical Spine Laser Bus */}
          <linearGradient id={spineRId} x1="23.5" y1="5" x2="23.5" y2="27" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#a7f3d0" />
            <stop offset="60%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>

          {/* Crossbar Horizontal Laser Linkage */}
          <linearGradient id={bridgeId} x1="8.5" y1="16" x2="23.5" y2="16" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>

          {/* Central Nexus Radial Core */}
          <radialGradient id={nexusId} cx="16" cy="16" r="4.5" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#34d399" />
            <stop offset="70%" stopColor="#10b981" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Backlight Halo */}
        <circle cx="16" cy="16" r="14" fill={`url(#${auraId})`} />

        {/* Hardware Security Enclave Chassis (Precision Geometric Squircle) */}
        <rect
          x="1.75"
          y="1.75"
          width="28.5"
          height="28.5"
          rx="7.5"
          fill="#08080a"
          fillOpacity="0.95"
          stroke={`url(#${strokeId})`}
          strokeWidth="1"
        />

        {/* Precision Optical Registration Marks (4 corners) */}
        <path d="M 4 4.5 L 4 3.5 M 3.5 4 L 4.5 4" stroke="#ffffff" strokeWidth="0.7" strokeLinecap="round" opacity="0.4" />
        <path d="M 28 4.5 L 28 3.5 M 27.5 4 L 28.5 4" stroke="#ffffff" strokeWidth="0.7" strokeLinecap="round" opacity="0.4" />
        <path d="M 4 28.5 L 4 27.5 M 3.5 28 L 4.5 28" stroke="#06b6d4" strokeWidth="0.7" strokeLinecap="round" opacity="0.5" />
        <path d="M 28 28.5 L 28 27.5 M 27.5 28 L 28.5 28" stroke="#06b6d4" strokeWidth="0.7" strokeLinecap="round" opacity="0.5" />

        {/* Merkle DAG Diagonal State Invariant Linkages */}
        <line x1="8.5" y1="8.67" x2="16" y2="16" stroke="#10b981" strokeWidth="0.6" strokeDasharray="1.2,1.8" strokeOpacity="0.3" />
        <line x1="23.5" y1="8.67" x2="16" y2="16" stroke="#10b981" strokeWidth="0.6" strokeDasharray="1.2,1.8" strokeOpacity="0.3" />
        <line x1="8.5" y1="23.33" x2="16" y2="16" stroke="#06b6d4" strokeWidth="0.6" strokeDasharray="1.2,1.8" strokeOpacity="0.3" />
        <line x1="23.5" y1="23.33" x2="16" y2="16" stroke="#06b6d4" strokeWidth="0.6" strokeDasharray="1.2,1.8" strokeOpacity="0.3" />

        {/* Structural Laser Spine Bus Lines */}
        <line x1="8.5" y1="5" x2="8.5" y2="27" stroke={`url(#${spineLId})`} strokeWidth="1.1" strokeLinecap="round" strokeOpacity="0.5" />
        <line x1="23.5" y1="5" x2="23.5" y2="27" stroke={`url(#${spineRId})`} strokeWidth="1.1" strokeLinecap="round" strokeOpacity="0.5" />
        <line x1="8.5" y1="16" x2="23.5" y2="16" stroke={`url(#${bridgeId})`} strokeWidth="1.3" strokeLinecap="round" strokeOpacity="0.7" />

        {/* Ambient Coordinate Lattice Matrix Dots */}
        <circle cx="4.5" cy="10" r="0.6" fill="#ffffff" opacity="0.14" />
        <circle cx="4.5" cy="16" r="0.6" fill="#ffffff" opacity="0.14" />
        <circle cx="4.5" cy="22" r="0.6" fill="#ffffff" opacity="0.14" />

        <circle cx="27.5" cy="10" r="0.6" fill="#ffffff" opacity="0.14" />
        <circle cx="27.5" cy="16" r="0.6" fill="#ffffff" opacity="0.14" />
        <circle cx="27.5" cy="22" r="0.6" fill="#ffffff" opacity="0.14" />

        <circle cx="16" cy="5" r="0.6" fill="#ffffff" opacity="0.14" />
        <circle cx="16" cy="9.5" r="0.6" fill="#ffffff" opacity="0.14" />
        <circle cx="16" cy="22.5" r="0.6" fill="#ffffff" opacity="0.14" />
        <circle cx="16" cy="27" r="0.6" fill="#ffffff" opacity="0.14" />

        {/* ==================== HERA 'H' DOTTED GEOMETRIC PILLARS ==================== */}

        {/* Left Pillar (7 Precision Dotted Nodes: Platinum White -> Mint -> Emerald -> Cyan) */}
        <circle cx="8.5" cy="5" r="1.65" fill="#ffffff" />
        <circle cx="8.5" cy="8.67" r="1.5" fill="#e4e4e7" />
        <circle cx="8.5" cy="12.33" r="1.55" fill="#a7f3d0" />
        <circle cx="8.5" cy="16" r="2.0" fill="#10b981" stroke="#ffffff" strokeWidth="0.6" />
        <circle cx="8.5" cy="19.67" r="1.55" fill="#34d399" />
        <circle cx="8.5" cy="23.33" r="1.5" fill="#22d3ee" />
        <circle cx="8.5" cy="27" r="1.65" fill="#06b6d4" />

        {/* Right Pillar (7 Precision Dotted Nodes: Platinum White -> Mint -> Emerald -> Cyan) */}
        <circle cx="23.5" cy="5" r="1.65" fill="#ffffff" />
        <circle cx="23.5" cy="8.67" r="1.5" fill="#e4e4e7" />
        <circle cx="23.5" cy="12.33" r="1.55" fill="#a7f3d0" />
        <circle cx="23.5" cy="16" r="2.0" fill="#10b981" stroke="#ffffff" strokeWidth="0.6" />
        <circle cx="23.5" cy="19.67" r="1.55" fill="#34d399" />
        <circle cx="23.5" cy="23.33" r="1.5" fill="#22d3ee" />
        <circle cx="23.5" cy="27" r="1.65" fill="#06b6d4" />

        {/* Crossbar Intermediate Handshake Nodes */}
        <circle cx="12.25" cy="16" r="1.35" fill="#34d399" />
        <circle cx="19.75" cy="16" r="1.35" fill="#34d399" />

        {/* ==================== CENTRAL STATE VAULT CRYPTOGRAPHIC NEXUS ==================== */}
        {/* Radial Bloom Flare */}
        <circle cx="16" cy="16" r="3.8" fill={`url(#${nexusId})`} opacity="0.45" />
        {/* Obsidian Core Aperture with Emerald Security Rim */}
        <circle cx="16" cy="16" r="2.3" fill="#070709" stroke="#10b981" strokeWidth="0.9" />
        {/* Pure Diamond Singularity Node */}
        <circle cx="16" cy="16" r="1.1" fill="#ffffff" />
      </svg>
    </div>
  );
}
