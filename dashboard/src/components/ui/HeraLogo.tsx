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
}: HeraLogoProps) {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9]/g, "_");

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 select-none transform transition-transform duration-200 hover:scale-105"
        aria-label="Hera StateGuard Logo"
      >
        {/* Hardware Security Enclave Chassis */}
        <rect
          x="1.5"
          y="1.5"
          width="29"
          height="29"
          rx="7"
          fill="#060608"
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth="1"
        />

        {/* Optical Viewfinder L-Brackets */}
        <path
          d="M 4 6.5 L 4 4 L 6.5 4"
          stroke="#71717a"
          strokeWidth="0.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 28 6.5 L 28 4 L 25.5 4"
          stroke="#71717a"
          strokeWidth="0.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 4 25.5 L 4 28 L 6.5 28"
          stroke="#71717a"
          strokeWidth="0.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 28 25.5 L 28 28 L 25.5 28"
          stroke="#71717a"
          strokeWidth="0.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Cardinal Midpoint Alignment Ticks */}
        <line x1="16" y1="1.5" x2="16" y2="3.5" stroke="rgba(255,255,255,0.2)" strokeWidth="0.75" />
        <line x1="16" y1="28.5" x2="16" y2="30.5" stroke="rgba(255,255,255,0.2)" strokeWidth="0.75" />
        <line x1="1.5" y1="16" x2="3.5" y2="16" stroke="rgba(255,255,255,0.2)" strokeWidth="0.75" />
        <line x1="28.5" y1="16" x2="30.5" y2="16" stroke="rgba(255,255,255,0.2)" strokeWidth="0.75" />

        {/* Inactive Ambient Coordinate Matrix Dots */}
        <circle cx="5.5" cy="9" r="0.55" fill="#3f3f46" opacity="0.35" />
        <circle cx="5.5" cy="12.5" r="0.55" fill="#3f3f46" opacity="0.35" />
        <circle cx="5.5" cy="16" r="0.55" fill="#3f3f46" opacity="0.35" />
        <circle cx="5.5" cy="19.5" r="0.55" fill="#3f3f46" opacity="0.35" />
        <circle cx="5.5" cy="23" r="0.55" fill="#3f3f46" opacity="0.35" />

        <circle cx="26.5" cy="9" r="0.55" fill="#3f3f46" opacity="0.35" />
        <circle cx="26.5" cy="12.5" r="0.55" fill="#3f3f46" opacity="0.35" />
        <circle cx="26.5" cy="16" r="0.55" fill="#3f3f46" opacity="0.35" />
        <circle cx="26.5" cy="19.5" r="0.55" fill="#3f3f46" opacity="0.35" />
        <circle cx="26.5" cy="23" r="0.55" fill="#3f3f46" opacity="0.35" />

        <circle cx="12.5" cy="5.5" r="0.55" fill="#3f3f46" opacity="0.35" />
        <circle cx="16" cy="5.5" r="0.55" fill="#3f3f46" opacity="0.35" />
        <circle cx="19.5" cy="5.5" r="0.55" fill="#3f3f46" opacity="0.35" />

        <circle cx="12.5" cy="26.5" r="0.55" fill="#3f3f46" opacity="0.35" />
        <circle cx="16" cy="26.5" r="0.55" fill="#3f3f46" opacity="0.35" />
        <circle cx="19.5" cy="26.5" r="0.55" fill="#3f3f46" opacity="0.35" />

        {/* Structural Laser Spine Bus Lines */}
        <line x1="9" y1="5.5" x2="9" y2="26.5" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.3" />
        <line x1="23" y1="5.5" x2="23" y2="26.5" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.3" />
        <line x1="9" y1="16" x2="23" y2="16" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.4" />

        {/* Diagonal Merkle Invariant Linkages */}
        <line x1="9" y1="9" x2="16" y2="16" stroke="#10b981" strokeWidth="0.6" strokeDasharray="1 1.2" strokeOpacity="0.35" />
        <line x1="23" y1="9" x2="16" y2="16" stroke="#10b981" strokeWidth="0.6" strokeDasharray="1 1.2" strokeOpacity="0.35" />
        <line x1="9" y1="23" x2="16" y2="16" stroke="#10b981" strokeWidth="0.6" strokeDasharray="1 1.2" strokeOpacity="0.35" />
        <line x1="23" y1="23" x2="16" y2="16" stroke="#10b981" strokeWidth="0.6" strokeDasharray="1 1.2" strokeOpacity="0.35" />

        {/* Left Pillar Active Dotted Nodes */}
        <circle cx="9" cy="5.5" r="1.5" fill="#ffffff" />
        <circle cx="9" cy="5.5" r="2.3" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.45" fill="none" />
        <circle cx="9" cy="9.0" r="1.35" fill="#ffffff" />
        <circle cx="9" cy="12.5" r="1.35" fill="#ffffff" />
        <circle cx="9" cy="16.0" r="1.6" fill="#ffffff" stroke="#10b981" strokeWidth="0.75" />
        <circle cx="9" cy="19.5" r="1.35" fill="#ffffff" />
        <circle cx="9" cy="23.0" r="1.35" fill="#ffffff" />
        <circle cx="9" cy="26.5" r="1.5" fill="#ffffff" />
        <circle cx="9" cy="26.5" r="2.3" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.45" fill="none" />

        {/* Right Pillar Active Dotted Nodes */}
        <circle cx="23" cy="5.5" r="1.5" fill="#ffffff" />
        <circle cx="23" cy="5.5" r="2.3" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.45" fill="none" />
        <circle cx="23" cy="9.0" r="1.35" fill="#ffffff" />
        <circle cx="23" cy="12.5" r="1.35" fill="#ffffff" />
        <circle cx="23" cy="16.0" r="1.6" fill="#ffffff" stroke="#10b981" strokeWidth="0.75" />
        <circle cx="23" cy="19.5" r="1.35" fill="#ffffff" />
        <circle cx="23" cy="23.0" r="1.35" fill="#ffffff" />
        <circle cx="23" cy="26.5" r="1.5" fill="#ffffff" />
        <circle cx="23" cy="26.5" r="2.3" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.45" fill="none" />

        {/* Crossbar Nodes */}
        <circle cx="12.5" cy="16.0" r="1.2" fill="#ffffff" />
        <circle cx="19.5" cy="16.0" r="1.2" fill="#ffffff" />

        {/* Central Cryptographic Core (Zero Blur, Crisp Vector Precision) */}
        <circle cx="16" cy="16" r="2.4" stroke="#10b981" strokeWidth="0.9" fill="#060608" />
        <polygon points="16,14.6 17.4,16 16,17.4 14.6,16" fill="#10b981" />
      </svg>
    </div>
  );
}
