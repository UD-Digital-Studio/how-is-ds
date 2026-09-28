import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "How's DS — Project follow-up",
    short_name: "How's DS",
    description: "A clear view of every project, milestone and client report.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f8f7fa",
    theme_color: "#00aebb",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
