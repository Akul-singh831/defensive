import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Apex University ERP - Enterprise Campus Workspace";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0a",
          padding: 48,
          fontFamily: "system-ui, sans-serif",
          position: "relative",
          color: "#ffffff",
        }}
      >
        {/* top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "#10b981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#0a0a0a",
                fontSize: 22,
                fontWeight: 800,
              }}
            >
              🎓
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em", color: "#ffffff" }}>
                Apex University
              </span>
              <span style={{ fontSize: 11, color: "#10b981", fontFamily: "monospace" }}>Enterprise ERP Core</span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              border: "1px solid #27272a",
              borderRadius: 999,
              padding: "6px 14px",
              background: "#18181b",
              fontSize: 12,
              color: "#a1a1aa",
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: 999, background: "#10b981", display: "flex" }} />
            Turso SQLite Edge Database
          </div>
        </div>

        {/* hero */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 32 }}>
          <span style={{ fontSize: 56, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.05, color: "#ffffff" }}>
            Admissions & Academic Management ERP
          </span>
          <span style={{ fontSize: 20, color: "#a1a1aa", maxWidth: 800, lineHeight: 1.4 }}>
            Enterprise course catalog governance, collision-free timetable scheduling, gradebook validation, and admissions pipeline.
          </span>
        </div>

        {/* footer badges */}
        <div style={{ display: "flex", gap: 12, borderTop: "1px solid #27272a", paddingTop: 24 }}>
          {["Module 1: Admissions", "Module 2: Academic", "Turso Edge DB", "Role-Based Access"].map((item) => (
            <div
              key={item}
              style={{
                background: "#18181b",
                border: "1px solid #27272a",
                borderRadius: 8,
                padding: "8px 14px",
                fontSize: 12,
                color: "#d4d4d8",
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
