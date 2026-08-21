import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "Ethical Hacking Project — Semester 5 Workspace. Next.js • Tailwind • shadcn • TypeScript • Turso";
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
          background: "#ffffff",
          padding: 48,
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(to right, #8080800a 1px, transparent 1px), linear-gradient(to bottom, #8080800a 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        {/* gradient fade */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(800px 400px at 80% 0%, rgba(16,185,129,0.08), transparent 60%), radial-gradient(600px 400px at 0% 100%, rgba(59,130,246,0.06), transparent 60%)",
          }}
        />

        {/* top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "#0a0a0a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              ◆
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.02em", color: "#0a0a0a" }}>
                ethical-hacking-project
              </span>
              <span style={{ fontSize: 11, color: "#71717a", fontFamily: "monospace" }}>Next.js 16 • Turso ready</span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              border: "1px solid #e4e4e7",
              borderRadius: 999,
              padding: "6px 12px",
              background: "white",
              fontSize: 11,
              color: "#71717a",
              fontFamily: "monospace",
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: 999, background: "#10b981", display: "flex" }} />
            Semester 5 • Branch per team
          </div>
        </div>

        {/* hero */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "white",
              border: "1px solid #e4e4e7",
              borderRadius: 999,
              padding: "6px 12px",
              alignSelf: "flex-start",
              fontSize: 11,
              color: "#52525b",
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: 999, background: "#10b981" }} />
            Ethical Hacking • Cybersecurity Workspace
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 64, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 0.95, color: "#0a0a0a" }}>
              Ethical Hacking
            </span>
            <span style={{ fontSize: 64, fontWeight: 300, letterSpacing: "-0.04em", lineHeight: 0.95, color: "#71717a" }}>
              Project Workspace
            </span>
          </div>
          <span style={{ fontSize: 18, color: "#52525b", lineHeight: 1.5, maxWidth: 760 }}>
            Shared Next.js + Tailwind + shadcn + TypeScript + Turso stack. Each team ships its module as an isolated
            route + library code.
          </span>
        </div>

        {/* stack pills */}
        <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
          {[
            "Tailwind CSS v4",
            "shadcn/ui",
            "TypeScript",
            "Turso (SQLite)",
            "Drizzle ORM",
          ].map((label) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                background: "white",
                border: "1px solid #e4e4e7",
                borderRadius: 999,
                padding: "8px 14px",
                fontSize: 12,
                fontWeight: 600,
                color: "#18181b",
                boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
          <span style={{ fontSize: 11, fontFamily: "monospace", color: "#a1a1aa" }}>
            bun run db:sync • git checkout -b team/&lt;name&gt; • lib/schema.ts only shared file
          </span>
          <span style={{ fontSize: 11, color: "#a1a1aa" }}>© 2026 Semester 5</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
