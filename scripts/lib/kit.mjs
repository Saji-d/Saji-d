// Shared helpers for every generated SVG: palettes that mirror the portfolio's
// design tokens (app/globals.css), embedded font faces, and small utilities.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = (p) => readFileSync(join(ROOT, p));

// Dark values are copied from the portfolio. Light values are the same hues
// pulled darker so contrast holds on a white page.
export const THEMES = {
  dark: {
    name: "dark",
    bg: "#080812",
    surface: "#11111f",
    surface2: "#171728",
    line: "#2a2b4a",
    lineStrong: "#3a3c68",
    text: "#f8fafc",
    textSoft: "#b4b8c8",
    muted: "#9ca3af",
    accent: "#818cf8",
    accentFill: "#6366f1",
    violet: "#a855f7",
    cyan: "#22d3ee",
    good: "#3fb28a",
    warn: "#e8b44b",
    bad: "#e05b5b",
    nameFrom: "#f8fafc",
    nameTo: "#c7d2fe",
    glowA: "rgba(99,102,241,0.30)",
    glowB: "rgba(168,85,247,0.20)",
    dot: "rgba(148,163,255,0.14)",
    chip: "rgba(99,102,241,0.14)",
    chipLine: "rgba(129,140,248,0.32)",
    imgShade: "0.0",
  },
  light: {
    name: "light",
    bg: "#f6f6fd",
    surface: "#ffffff",
    surface2: "#eef0fc",
    line: "#d9dbf2",
    lineStrong: "#b9bce6",
    text: "#0e0f24",
    textSoft: "#44476b",
    muted: "#5d6185",
    accent: "#4f46e5",
    accentFill: "#4f46e5",
    violet: "#9333ea",
    cyan: "#0e7490",
    good: "#15803d",
    warn: "#a16207",
    bad: "#b91c1c",
    nameFrom: "#0e0f24",
    nameTo: "#4338ca",
    glowA: "rgba(99,102,241,0.18)",
    glowB: "rgba(168,85,247,0.12)",
    dot: "rgba(67,56,202,0.12)",
    chip: "rgba(79,70,229,0.08)",
    chipLine: "rgba(79,70,229,0.28)",
    imgShade: "0.0",
  },
};

const FONT_FILES = {
  "sg700": ["Space Grotesk", 700, "assets/fonts/SpaceGrotesk-700.woff2"],
  "sg500": ["Space Grotesk", 500, "assets/fonts/SpaceGrotesk-500.woff2"],
  "in400": ["Inter", 400, "assets/fonts/Inter-400.woff2"],
  "in600": ["Inter", 600, "assets/fonts/Inter-600.woff2"],
  "jb500": ["JetBrains Mono", 500, "assets/fonts/JetBrainsMono-500.woff2"],
};

export const FONT_STACK = {
  display: "'Space Grotesk', 'Inter', ui-sans-serif, system-ui, sans-serif",
  sans: "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
  mono: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
};

export function fontFaces(keys) {
  return keys
    .map((k) => {
      const [family, weight, file] = FONT_FILES[k];
      const b64 = read(file).toString("base64");
      return `@font-face{font-family:'${family}';font-weight:${weight};font-style:normal;src:url(data:font/woff2;base64,${b64}) format('woff2');}`;
    })
    .join("");
}

export const REDUCED_MOTION = "@media (prefers-reduced-motion:reduce){*{animation:none!important}}";

export function imageDataUri(path, mime = "image/jpeg") {
  return `data:${mime};base64,${read(path).toString("base64")}`;
}

export const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Rough advance width for layout (we do not have a text shaper here).
export function textWidth(str, size, kind = "sans") {
  const k = { sans: 0.575, display: 0.56, mono: 0.6 }[kind];
  return Math.ceil(str.length * size * k);
}

export const ICONS = JSON.parse(readFileSync(join(ROOT, "scripts/lib/icons.json"), "utf8"));

// Wraps a body in a complete SVG document.
export function svgDoc({ w, h, title, desc, theme, fonts, css = "", body, defs = "" }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="t d">
<title id="t">${esc(title)}</title>
<desc id="d">${esc(desc)}</desc>
<style>${fontFaces(fonts)}
${css}
${REDUCED_MOTION}</style>
<defs>${defs}</defs>
${body}
</svg>
`;
}
