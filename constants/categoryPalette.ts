import { Category } from "./categories";

export const categoryPalette: Record<Category, { soft: string; tint: string; text: string }> = {
  Life: { soft: "rgba(167,139,250,0.15)", tint: "rgba(167,139,250,0.35)", text: "#A78BFA" },
  Love: { soft: "rgba(244,114,182,0.15)", tint: "rgba(244,114,182,0.35)", text: "#F472B6" },
  Career: { soft: "rgba(251,146,60,0.15)", tint: "rgba(251,146,60,0.35)", text: "#FB923C" },
  Money: { soft: "rgba(74,222,128,0.15)", tint: "rgba(74,222,128,0.35)", text: "#4ADE80" },
  Health: { soft: "rgba(56,189,248,0.15)", tint: "rgba(56,189,248,0.35)", text: "#38BDF8" },
  Fun: { soft: "rgba(252,211,77,0.15)", tint: "rgba(252,211,77,0.35)", text: "#FCD34D" },
  Other: { soft: "rgba(148,163,184,0.15)", tint: "rgba(148,163,184,0.35)", text: "#94A3B8" },
};

