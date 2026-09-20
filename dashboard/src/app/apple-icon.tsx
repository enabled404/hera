import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#070709",
          borderRadius: "40px",
          border: "2px solid rgba(255, 255, 255, 0.12)",
        }}
      >
        <svg
          width="130"
          height="130"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="appleAura" cx="16" cy="16" r="14" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#050507" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="appleSpine" x1="16" y1="5" x2="16" y2="27" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="35%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="appleBridge" x1="8.5" y1="16" x2="23.5" y2="16" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* Background Aura */}
          <circle cx="16" cy="16" r="14" fill="url(#appleAura)" />

          {/* Enclave Chassis */}
          <rect
            x="1.75"
            y="1.75"
            width="28.5"
            height="28.5"
            rx="7.5"
            fill="#09090c"
            stroke="#10b981"
            strokeWidth="1.2"
          />

          {/* Corner Crosses */}
          <path d="M 4 4.5 L 4 3.5 M 3.5 4 L 4.5 4" stroke="#ffffff" strokeWidth="0.8" opacity="0.6" />
          <path d="M 28 4.5 L 28 3.5 M 27.5 4 L 28.5 4" stroke="#ffffff" strokeWidth="0.8" opacity="0.6" />
          <path d="M 4 28.5 L 4 27.5 M 3.5 28 L 4.5 28" stroke="#06b6d4" strokeWidth="0.8" opacity="0.6" />
          <path d="M 28 28.5 L 28 27.5 M 27.5 28 L 28.5 28" stroke="#06b6d4" strokeWidth="0.8" opacity="0.6" />

          {/* Merkle Linkages */}
          <line x1="8.5" y1="8.67" x2="16" y2="16" stroke="#10b981" strokeWidth="0.7" strokeDasharray="1.2,1.8" strokeOpacity="0.4" />
          <line x1="23.5" y1="8.67" x2="16" y2="16" stroke="#10b981" strokeWidth="0.7" strokeDasharray="1.2,1.8" strokeOpacity="0.4" />
          <line x1="8.5" y1="23.33" x2="16" y2="16" stroke="#06b6d4" strokeWidth="0.7" strokeDasharray="1.2,1.8" strokeOpacity="0.4" />
          <line x1="23.5" y1="23.33" x2="16" y2="16" stroke="#06b6d4" strokeWidth="0.7" strokeDasharray="1.2,1.8" strokeOpacity="0.4" />

          {/* Spine and Crossbar */}
          <line x1="8.5" y1="5" x2="8.5" y2="27" stroke="url(#appleSpine)" strokeWidth="1.3" strokeLinecap="round" strokeOpacity="0.6" />
          <line x1="23.5" y1="5" x2="23.5" y2="27" stroke="url(#appleSpine)" strokeWidth="1.3" strokeLinecap="round" strokeOpacity="0.6" />
          <line x1="8.5" y1="16" x2="23.5" y2="16" stroke="url(#appleBridge)" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8" />

          {/* Dotted Grid Ambient Dots */}
          <circle cx="4.5" cy="10" r="0.7" fill="#ffffff" opacity="0.2" />
          <circle cx="4.5" cy="16" r="0.7" fill="#ffffff" opacity="0.2" />
          <circle cx="4.5" cy="22" r="0.7" fill="#ffffff" opacity="0.2" />
          <circle cx="27.5" cy="10" r="0.7" fill="#ffffff" opacity="0.2" />
          <circle cx="27.5" cy="16" r="0.7" fill="#ffffff" opacity="0.2" />
          <circle cx="27.5" cy="22" r="0.7" fill="#ffffff" opacity="0.2" />

          {/* Left Pillar 7 Nodes */}
          <circle cx="8.5" cy="5" r="1.8" fill="#ffffff" />
          <circle cx="8.5" cy="8.67" r="1.6" fill="#e4e4e7" />
          <circle cx="8.5" cy="12.33" r="1.7" fill="#a7f3d0" />
          <circle cx="8.5" cy="16" r="2.2" fill="#10b981" stroke="#ffffff" strokeWidth="0.7" />
          <circle cx="8.5" cy="19.67" r="1.7" fill="#34d399" />
          <circle cx="8.5" cy="23.33" r="1.6" fill="#22d3ee" />
          <circle cx="8.5" cy="27" r="1.8" fill="#06b6d4" />

          {/* Right Pillar 7 Nodes */}
          <circle cx="23.5" cy="5" r="1.8" fill="#ffffff" />
          <circle cx="23.5" cy="8.67" r="1.6" fill="#e4e4e7" />
          <circle cx="23.5" cy="12.33" r="1.7" fill="#a7f3d0" />
          <circle cx="23.5" cy="16" r="2.2" fill="#10b981" stroke="#ffffff" strokeWidth="0.7" />
          <circle cx="23.5" cy="19.67" r="1.7" fill="#34d399" />
          <circle cx="23.5" cy="23.33" r="1.6" fill="#22d3ee" />
          <circle cx="23.5" cy="27" r="1.8" fill="#06b6d4" />

          {/* Crossbar Nodes */}
          <circle cx="12.25" cy="16" r="1.5" fill="#34d399" />
          <circle cx="19.75" cy="16" r="1.5" fill="#34d399" />

          {/* Central Nexus Core */}
          <circle cx="16" cy="16" r="4.0" fill="#10b981" fillOpacity="0.4" />
          <circle cx="16" cy="16" r="2.5" fill="#09090c" stroke="#10b981" strokeWidth="1.1" />
          <circle cx="16" cy="16" r="1.3" fill="#ffffff" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
