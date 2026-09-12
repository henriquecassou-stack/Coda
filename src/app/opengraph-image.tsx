import { ImageResponse } from "next/og";
import { brand } from "@/lib/content";

/**
 * The card people see when the link is shared on WhatsApp, LinkedIn or X.
 * Generated at build time from the same brand tokens as the site, so it can
 * never drift from the palette the way a hand-exported PNG would.
 */
export const alt = "CODA — Websites + Automações";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GRADIENT = "linear-gradient(115deg, #2dd4f0 0%, #3d5cff 52%, #8b5cf6 100%)";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#050507",
          // Radial wash instead of a blurred circle: Satori has no filter:
          // blur(), so a shape would render with a hard edge.
          backgroundImage: "radial-gradient(at 88% 6%, #1a2450 0%, #050507 58%)",
          padding: 80,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="76" height="76" viewBox="0 0 240 240" fill="none">
            <defs>
              <linearGradient id="og" x1="205" y1="40" x2="95" y2="205" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#2dd4f0" />
                <stop offset="52%" stopColor="#3d5cff" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            <path
              d="M112 108 C124 116 124 132 112 140 C102 146 92 142 88 132 C84 122 90 112 100 108 C104 106 108 106 112 108Z"
              fill="#1c2340"
            />
            <path
              d="M188 46 L82 120 L188 194"
              stroke="url(#og)"
              strokeWidth="46"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div style={{ display: "flex", fontSize: 52, fontWeight: 700, color: "#ffffff", letterSpacing: 8 }}>
            {brand.name}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div
            style={{
              display: "flex",
              fontSize: 76,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.05,
              maxWidth: 900,
            }}
          >
            Automações com IA e sites que convertem.
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#9a9aa8", maxWidth: 860 }}>
            {brand.tagline}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ display: "flex", width: 180, height: 6, borderRadius: 9999, backgroundImage: GRADIENT }} />
          <div style={{ display: "flex", fontSize: 26, color: "#82828e", letterSpacing: 2 }}>
            {brand.email}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
