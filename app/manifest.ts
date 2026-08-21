import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ethical Hacking Project — Semester 5",
    short_name: "EHP",
    description:
      "Semester 5 workspace for the Ethical Hacking course. Next.js + Tailwind + shadcn + TypeScript + Turso.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0a0a0a",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
