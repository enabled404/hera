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
          background: "#050506",
          borderRadius: "40px",
          border: "2px solid rgba(255, 255, 255, 0.12)",
        }}
      >
        <svg
          width="120"
          height="120"
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
          <rect
            x="12.5"
            y="14.2"
            width="7"
            height="3"
            rx="1"
            fill="#10b981"
          />
          <path
            d="M 16,13.8 L 17.6,15.7 L 16,17.6 L 14.4,15.7 Z"
            fill="#ffffff"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
