import { BackgroundConfig } from "@/types";

export const BACKGROUND_PRESETS: Record<string, BackgroundConfig[]> = {
  Midnight: [
    {
      id: "base-midnight",
      name: "Midnight Base",
      type: "solid",
      properties: { color: "#050508" },
      layerSettings: { opacity: 1, blendMode: "normal", isVisible: true },
    },
    {
      id: "gradient-midnight",
      name: "Midnight Glow",
      type: "gradient",
      properties: {
        gradientType: "radial",
        gradientStops: [
          { color: "rgba(6, 182, 212, 0.05)", position: 0 },
          { color: "transparent", position: 70 },
        ],
      },
      layerSettings: { opacity: 1, blendMode: "screen", isVisible: true },
    },
  ],
  Cyberpunk: [
    {
      id: "base-cyber",
      name: "Cyber Base",
      type: "solid",
      properties: { color: "#0a001a" },
      layerSettings: { opacity: 1, blendMode: "normal", isVisible: true },
    },
    {
      id: "neon-cyber",
      name: "Neon City",
      type: "gradient",
      properties: {
        gradientType: "linear",
        gradientAngle: 45,
        gradientStops: [
          { color: "rgba(255, 0, 255, 0.1)", position: 0 },
          { color: "rgba(0, 255, 255, 0.1)", position: 100 },
        ],
        animatedGradient: true,
      },
      layerSettings: { opacity: 1, blendMode: "screen", isVisible: true },
    },
  ],
  Cosmic: [
    {
      id: "base-cosmic",
      name: "Space Base",
      type: "solid",
      properties: { color: "#000000" },
      layerSettings: { opacity: 1, blendMode: "normal", isVisible: true },
    },
    {
      id: "stars-cosmic",
      name: "Distant Stars",
      type: "live",
      properties: { url: "particles", fpsLimit: 60 },
      layerSettings: { opacity: 0.5, blendMode: "screen", isVisible: true },
    },
  ],
};
