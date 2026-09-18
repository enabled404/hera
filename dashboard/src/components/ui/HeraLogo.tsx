"use client";

import React from "react";

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
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {glow && (
        <div
          className="absolute inset-0 rounded-full bg-emerald-500/20 blur-md pointer-events-none transform scale-125"
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
      >
        <defs>
          {/* Platinum / Metallic Gradient for Pillars */}
          <linearGradient id="heraPillarLeft" x1="9" y1="7" x2="13" y2="25" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#e4e4e7" />
            <stop offset="100%" stopColor="#a1a1aa" />
          </linearGradient>

          <linearGradient id="heraPillarRight" x1="19" y1="7" x2="23" y2="25" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#d4d4d8" />
            <stop offset="100%" stopColor="#71717a" />
          </linearGradient>

          {/* Cryptographic Bridge Gradient (Electric Emerald -> Cyan) */}
          <linearGradient id="heraBridge" x1="11" y1="15.5" x2="21" y2="15.5" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>

          {/* Hex-Shield Stroke Gradient */}
          <linearGradient id="heraShieldStroke" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="40%" stopColor="#10b981" stopOpacity="0.6" />
            <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
          </linearGradient>

          {/* Faceted Shield Subtle Fill */}
          <linearGradient id="heraShieldFill" x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#18181b" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#09090b" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        {/* 1. Outer Faceted Hex-Shield */}
        <path
          d="M 16,3.2 L 27.5,8.2 L 27.5,19.2 L 16,28.8 L 4.5,19.2 L 4.5,8.2 Z"
          fill="url(#heraShieldFill)"
          stroke="url(#heraShieldStroke)"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Shield Corner Micro-Accents */}
        <circle cx="16" cy="3.2" r="1.2" fill="#10b981" />
        <circle cx="16" cy="28.8" r="1.2" fill="#06b6d4" />

        {/* 2. Left Monolithic Pillar of 'H' with Chamfered Tops */}
        <path
          d="M 9.5,10.2 L 11.2,8.5 L 13.5,8.5 L 13.5,22.8 L 11.2,24.2 L 9.5,22.8 Z"
          fill="url(#heraPillarLeft)"
        />

        {/* 3. Right Monolithic Pillar of 'H' with Chamfered Tops */}
        <path
          d="M 18.5,8.5 L 20.8,8.5 L 22.5,10.2 L 22.5,22.8 L 20.8,24.2 L 18.5,22.8 Z"
          fill="url(#heraPillarRight)"
        />

        {/* 4. Authenticated Cryptographic Bridge (Crossbar) */}
        <rect
          x="12.5"
          y="14.2"
          width="7"
          height="3"
          rx="1"
          fill="url(#heraBridge)"
        />

        {/* 5. Central Cryptographic Keyway Node (Diamond Anchor) */}
        <path
          d="M 16,13.8 L 17.6,15.7 L 16,17.6 L 14.4,15.7 Z"
          fill="#ffffff"
          className="animate-pulse"
        />
      </svg>
    </div>
  );
}
