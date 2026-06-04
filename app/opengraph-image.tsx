import { ImageResponse } from "next/og";

export const alt = "Gulf-Rig — Oil & Gas Gulf Jobs, Updated Daily";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const LOCATIONS = ["Oman", "Qatar", "UAE", "Saudi", "Kuwait", "Bahrain", "Iraq"];

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
            "linear-gradient(135deg, #0d1b2a 0%, #16365a 48%, #0d2a1a 100%)",
          padding: "60px 70px",
          fontFamily: "sans-serif",
        }}
      >
        {/* glow accent */}
        <div
          style={{
            position: "absolute",
            top: -160,
            right: -160,
            width: 480,
            height: 480,
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
              width: 72,
              height: 72,
              borderRadius: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#ff7a00",
              backgroundImage: "linear-gradient(135deg, #ff6b00, #ffcc00)",
              fontSize: 38,
              fontWeight: 800,
              color: "#1a1000",
            }}
          >
            GR
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginLeft: 20 }}>
            <div style={{ fontSize: 38, fontWeight: 800, color: "#ffffff" }}>
              Gulf-Rig
            </div>
            <div
              style={{
                fontSize: 18,
                color: "rgba(255,255,255,0.55)",
                letterSpacing: 3,
              }}
            >
              OIL &amp; GAS JOB PORTAL
            </div>
          </div>

          {/* updated badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginLeft: "auto",
              backgroundColor: "rgba(0,200,100,0.14)",
              border: "1px solid rgba(0,200,100,0.4)",
              borderRadius: 9999,
              padding: "10px 22px",
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 9999,
                backgroundColor: "#3ddc84",
                marginRight: 10,
                display: "flex",
              }}
            />
            <div style={{ fontSize: 20, fontWeight: 700, color: "#3ddc84", letterSpacing: 1 }}>
              UPDATED DAILY
            </div>
          </div>
        </div>

        {/* ── Headline block ── */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 82,
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.05,
            }}
          >
            Oil &amp; Gas Gulf Jobs
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 82,
              fontWeight: 800,
              color: "#ff9d4d",
              lineHeight: 1.05,
              marginTop: 4,
            }}
          >
            Posted Every Day
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              color: "rgba(255,255,255,0.75)",
              marginTop: 26,
            }}
          >
            Instrument · Mechanical · Electrical · Rotating · Operations
          </div>
        </div>

        {/* ── Locations + CTA ── */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {LOCATIONS.map((loc) => (
              <div
                key={loc}
                style={{
                  display: "flex",
                  fontSize: 24,
                  fontWeight: 600,
                  color: "#ffd966",
                  backgroundColor: "rgba(255,200,0,0.1)",
                  border: "1px solid rgba(255,200,0,0.28)",
                  borderRadius: 9999,
                  padding: "8px 22px",
                  marginRight: 14,
                  marginBottom: 6,
                }}
              >
                {loc}
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: 30,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#ff7a00",
                backgroundImage: "linear-gradient(135deg, #ff6b00, #ffcc00)",
                borderRadius: 16,
                padding: "20px 36px",
              }}
            >
              <div style={{ fontSize: 34, fontWeight: 800, color: "#1a1000" }}>
                www.gulf-rig.com
              </div>
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 26,
                fontWeight: 700,
                color: "#ffffff",
                marginLeft: 28,
              }}
            >
              Free to browse &amp; apply →
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
