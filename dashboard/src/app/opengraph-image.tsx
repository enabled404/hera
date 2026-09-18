import { ImageResponse } from "next/og";

export const alt = "Hera | Zero-Trust AI State Gateway & Reasoning Trace Auditor";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          backgroundColor: "#050506",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {/* Subtle Ambient Background Lighting */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, rgba(5, 5, 6, 0) 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, rgba(5, 5, 6, 0) 70%)",
          }}
        />

        {/* Top Header Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            zIndex: 10,
          }}
        >
          {/* Brand Mark + Title */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <svg
              width="48"
              height="48"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 16,3.2 L 27.5,8.2 L 27.5,19.2 L 16,28.8 L 4.5,19.2 L 4.5,8.2 Z"
                fill="#0c0c0e"
                stroke="#10b981"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <circle cx="16" cy="3.2" r="1.4" fill="#10b981" />
              <circle cx="16" cy="28.8" r="1.4" fill="#06b6d4" />
              <path
                d="M 9.5,10.2 L 11.2,8.5 L 13.5,8.5 L 13.5,22.8 L 11.2,24.2 L 9.5,22.8 Z"
                fill="#ffffff"
              />
              <path
                d="M 18.5,8.5 L 20.8,8.5 L 22.5,10.2 L 22.5,22.8 L 20.8,24.2 L 18.5,22.8 Z"
                fill="#d4d4d8"
              />
              <rect x="12.5" y="14.2" width="7" height="3" rx="1" fill="#10b981" />
              <path d="M 16,13.8 L 17.6,15.7 L 16,17.6 L 14.4,15.7 Z" fill="#ffffff" />
            </svg>

            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span
                style={{
                  fontSize: "32px",
                  fontWeight: 900,
                  color: "#ffffff",
                  letterSpacing: "-0.03em",
                }}
              >
                HERA
              </span>
              <span style={{ fontSize: "20px", color: "#52525b" }}>|</span>
              <span
                style={{
                  fontSize: "16px",
                  color: "#a1a1aa",
                  fontFamily: "monospace",
                  letterSpacing: "0.05em",
                }}
              >
                STATEGUARD v1.1
              </span>
            </div>
          </div>

          {/* Research Advisory Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "rgba(244, 63, 94, 0.12)",
              border: "1px solid rgba(244, 63, 94, 0.35)",
              padding: "8px 18px",
              borderRadius: "9999px",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#f43f5e",
              }}
            />
            <span
              style={{
                fontSize: "14px",
                color: "#fecdd3",
                fontFamily: "monospace",
                fontWeight: 600,
              }}
            >
              arXiv:2608.09867 (CVSS 8.6)
            </span>
          </div>
        </div>

        {/* Center Main Headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", zIndex: 10 }}>
          <h1
            style={{
              fontSize: "52px",
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              margin: 0,
            }}
          >
            Zero-Trust State Gateway &amp; Reasoning Trace Auditor
          </h1>
          <p
            style={{
              fontSize: "20px",
              color: "#a1a1aa",
              lineHeight: 1.45,
              maxWidth: "1000px",
              margin: 0,
            }}
          >
            Mitigating Cryptographic Contextual Misbinding in frontier LLMs. Neutralize
            asymmetric Decryption Oracles, prevent secret trapping in CoT reasoning, and enforce
            cryptographic state isolation in &lt; 0.49ms.
          </p>
        </div>

        {/* Bottom Feature Metrics & Author Attribution */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            paddingTop: "24px",
            zIndex: 10,
          }}
        >
          {/* Key Metrics */}
          <div style={{ display: "flex", gap: "36px" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "28px", fontWeight: 800, color: "#10b981", fontFamily: "monospace" }}>
                0.49ms
              </span>
              <span style={{ fontSize: "12px", color: "#71717a", fontFamily: "monospace", textTransform: "uppercase" }}>
                p99 Latency SLA
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "28px", fontWeight: 800, color: "#ffffff", fontFamily: "monospace" }}>
                100%
              </span>
              <span style={{ fontSize: "12px", color: "#71717a", fontFamily: "monospace", textTransform: "uppercase" }}>
                Replay Interception
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "28px", fontWeight: 800, color: "#06b6d4", fontFamily: "monospace" }}>
                H(X) &gt;= 4.2
              </span>
              <span style={{ fontSize: "12px", color: "#71717a", fontFamily: "monospace", textTransform: "uppercase" }}>
                Shannon Redaction
              </span>
            </div>
          </div>

          {/* Domain & Author Tag */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <span style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", fontFamily: "monospace" }}>
              herasec.vercel.app
            </span>
            <span style={{ fontSize: "13px", color: "#a1a1aa", marginTop: "4px" }}>
              Architect: Saad Khalid (@saadkhalidhere)
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
