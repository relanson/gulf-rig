import { ImageResponse } from "next/og";

export const alt = "Gulf-Rig — Oil & Gas Gulf Jobs, Updated Daily";
export const size = { width: 1080, height: 1080 };
export const contentType = "image/png";

const LOCATIONS = ["Oman", "Qatar", "UAE", "Saudi", "Kuwait", "Bahrain", "Iraq", "Libya"];
const ROLES = ["Instrumentation", "Mechanical", "Electrical", "Rotating", "Operations"];

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0d1b2a",
          backgroundImage:
            "linear-gradient(150deg, #0d1b2a 0%, #16365a 50%, #0d2a1a 100%)",
          padding: "72px 72px",
          fontFamily: "sans-serif",
        }}
      >
        {/* glow accent */}
        <div
          style={{
            position: "absolute",
            top: -200,
            right: -200,
            width: 620,
            height: 620,
            borderRadius: 9999,
            background:
              "radial-gradient(circle, rgba(255,150,40,0.22) 0%, rgba(255,150,40,0) 70%)",
            display: "flex",
          }}
        />

        {/* ── Brand row ── */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#ff7a00",
              backgroundImage: "linear-gradient(135deg, #ff6b00, #ffcc00)",
              fontSize: 44,
              fontWeight: 800,
              color: "#1a1000",
            }}
          >
            GR
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginLeft: 22 }}>
            <div style={{ fontSize: 46, fontWeight: 800, color: "#ffffff" }}>
              Gulf-Rig
            </div>
            <div
              style={{
                fontSize: 21,
                color: "rgba(255,255,255,0.55)",
                letterSpacing: 3,
              }}
            >
              OIL &amp; GAS JOB PORTAL
            </div>
          </div>
        </div>

        {/* ── Updated badge ── */}
        <div style={{ display: "flex" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "rgba(0,200,100,0.14)",
              border: "1px solid rgba(0,200,100,0.4)",
              borderRadius: 9999,
              padding: "12px 26px",
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 9999,
                backgroundColor: "#3ddc84",
                marginRight: 12,
                display: "flex",
              }}
            />
            <div style={{ fontSize: 24, fontWeight: 700, color: "#3ddc84", letterSpacing: 1 }}>
              UPDATED DAILY
            </div>
          </div>
        </div>

        {/* ── Headline block ── */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 96,
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.04,
            }}
          >
            Oil &amp; Gas
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 96,
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.04,
            }}
          >
            Gulf Jobs
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 88,
              fontWeight: 800,
              color: "#ff9d4d",
              lineHeight: 1.06,
              marginTop: 6,
            }}
          >
            Posted Daily
          </div>
        </div>

        {/* ── Roles ── */}
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {ROLES.map((r) => (
            <div
              key={r}
              style={{
                display: "flex",
                fontSize: 26,
                fontWeight: 600,
                color: "rgba(255,255,255,0.9)",
                backgroundColor: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.16)",
                borderRadius: 9999,
                padding: "10px 24px",
                marginRight: 14,
                marginBottom: 14,
              }}
            >
              {r}
            </div>
          ))}
        </div>

        {/* ── Locations ── */}
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {LOCATIONS.map((loc) => (
            <div
              key={loc}
              style={{
                display: "flex",
                fontSize: 26,
                fontWeight: 600,
                color: "#ffd966",
                backgroundColor: "rgba(255,200,0,0.1)",
                border: "1px solid rgba(255,200,0,0.28)",
                borderRadius: 9999,
                padding: "10px 24px",
                marginRight: 14,
                marginBottom: 14,
              }}
            >
              {loc}
            </div>
          ))}
        </div>

        {/* ── CTA bar ── */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#ff7a00",
              backgroundImage: "linear-gradient(135deg, #ff6b00, #ffcc00)",
              borderRadius: 18,
              padding: "24px 40px",
            }}
          >
            <div style={{ fontSize: 40, fontWeight: 800, color: "#1a1000" }}>
              www.gulf-rig.com
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              fontWeight: 700,
              color: "#ffffff",
              marginLeft: 28,
            }}
          >
            Free to apply →
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
