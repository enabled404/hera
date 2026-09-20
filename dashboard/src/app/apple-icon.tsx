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
          background: "#060608",
          borderRadius: "40px",
          border: "2px solid rgba(255, 255, 255, 0.12)",
        }}
      >
        <svg
          width="132"
          height="132"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Chassis */}
          <rect
            x="1.5"
            y="1.5"
            width="29"
            height="29"
            rx="7"
            fill="#060608"
            stroke="rgba(255, 255, 255, 0.14)"
            strokeWidth="1"
          />

          {/* L-Brackets */}
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

          {/* Cardinal Ticks */}
          <line x1="16" y1="1.5" x2="16" y2="3.5" stroke="rgba(255,255,255,0.25)" strokeWidth="0.75" />
          <line x1="16" y1="28.5" x2="16" y2="30.5" stroke="rgba(255,255,255,0.25)" strokeWidth="0.75" />
          <line x1="1.5" y1="16" x2="3.5" y2="16" stroke="rgba(255,255,255,0.25)" strokeWidth="0.75" />
          <line x1="28.5" y1="16" x2="30.5" y2="16" stroke="rgba(255,255,255,0.25)" strokeWidth="0.75" />

          {/* Inactive Matrix Dots */}
          <circle cx="5.5" cy="9" r="0.6" fill="#3f3f46" opacity="0.4" />
          <circle cx="5.5" cy="12.5" r="0.6" fill="#3f3f46" opacity="0.4" />
          <circle cx="5.5" cy="16" r="0.6" fill="#3f3f46" opacity="0.4" />
          <circle cx="5.5" cy="19.5" r="0.6" fill="#3f3f46" opacity="0.4" />
          <circle cx="5.5" cy="23" r="0.6" fill="#3f3f46" opacity="0.4" />

          <circle cx="26.5" cy="9" r="0.6" fill="#3f3f46" opacity="0.4" />
          <circle cx="26.5" cy="12.5" r="0.6" fill="#3f3f46" opacity="0.4" />
          <circle cx="26.5" cy="16" r="0.6" fill="#3f3f46" opacity="0.4" />
          <circle cx="26.5" cy="19.5" r="0.6" fill="#3f3f46" opacity="0.4" />
          <circle cx="26.5" cy="23" r="0.6" fill="#3f3f46" opacity="0.4" />

          <circle cx="12.5" cy="5.5" r="0.6" fill="#3f3f46" opacity="0.4" />
          <circle cx="16" cy="5.5" r="0.6" fill="#3f3f46" opacity="0.4" />
          <circle cx="19.5" cy="5.5" r="0.6" fill="#3f3f46" opacity="0.4" />

          <circle cx="12.5" cy="26.5" r="0.6" fill="#3f3f46" opacity="0.4" />
          <circle cx="16" cy="26.5" r="0.6" fill="#3f3f46" opacity="0.4" />
          <circle cx="19.5" cy="26.5" r="0.6" fill="#3f3f46" opacity="0.4" />

          {/* Spine and Crossbar Buses */}
          <line x1="9" y1="5.5" x2="9" y2="26.5" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.35" />
          <line x1="23" y1="5.5" x2="23" y2="26.5" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.35" />
          <line x1="9" y1="16" x2="23" y2="16" stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.45" />

          {/* Diagonal Merkle Invariant Linkages */}
          <line x1="9" y1="9" x2="16" y2="16" stroke="#10b981" strokeWidth="0.65" strokeDasharray="1 1.2" strokeOpacity="0.4" />
          <line x1="23" y1="9" x2="16" y2="16" stroke="#10b981" strokeWidth="0.65" strokeDasharray="1 1.2" strokeOpacity="0.4" />
          <line x1="9" y1="23" x2="16" y2="16" stroke="#10b981" strokeWidth="0.65" strokeDasharray="1 1.2" strokeOpacity="0.4" />
          <line x1="23" y1="23" x2="16" y2="16" stroke="#10b981" strokeWidth="0.65" strokeDasharray="1 1.2" strokeOpacity="0.4" />

          {/* Left Pillar */}
          <circle cx="9" cy="5.5" r="1.6" fill="#ffffff" />
          <circle cx="9" cy="5.5" r="2.4" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.45" fill="none" />
          <circle cx="9" cy="9.0" r="1.4" fill="#ffffff" />
          <circle cx="9" cy="12.5" r="1.4" fill="#ffffff" />
          <circle cx="9" cy="16.0" r="1.7" fill="#ffffff" stroke="#10b981" strokeWidth="0.8" />
          <circle cx="9" cy="19.5" r="1.4" fill="#ffffff" />
          <circle cx="9" cy="23.0" r="1.4" fill="#ffffff" />
          <circle cx="9" cy="26.5" r="1.6" fill="#ffffff" />
          <circle cx="9" cy="26.5" r="2.4" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.45" fill="none" />

          {/* Right Pillar */}
          <circle cx="23" cy="5.5" r="1.6" fill="#ffffff" />
          <circle cx="23" cy="5.5" r="2.4" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.45" fill="none" />
          <circle cx="23" cy="9.0" r="1.4" fill="#ffffff" />
          <circle cx="23" cy="12.5" r="1.4" fill="#ffffff" />
          <circle cx="23" cy="16.0" r="1.7" fill="#ffffff" stroke="#10b981" strokeWidth="0.8" />
          <circle cx="23" cy="19.5" r="1.4" fill="#ffffff" />
          <circle cx="23" cy="23.0" r="1.4" fill="#ffffff" />
          <circle cx="23" cy="26.5" r="1.6" fill="#ffffff" />
          <circle cx="23" cy="26.5" r="2.4" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.45" fill="none" />

          {/* Crossbar Nodes */}
          <circle cx="12.5" cy="16.0" r="1.3" fill="#ffffff" />
          <circle cx="19.5" cy="16.0" r="1.3" fill="#ffffff" />

          {/* Central Cryptographic Core */}
          <circle cx="16" cy="16" r="2.5" stroke="#10b981" strokeWidth="0.9" fill="#060608" />
          <polygon points="16,14.6 17.4,16 16,17.4 14.6,16" fill="#10b981" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
