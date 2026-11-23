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
  // "Night shift": Dhaka after dark. Ink-teal sky, amber windows, mint signal.
  dark: {
    name: "dark",
    bg: "#07141c",
    skyTop: "#040c14",
    skyMid: "#0a2230",
    skyLow: "#164557",
    surface: "#0d2230",
    surface2: "#123043",
    line: "#1f4558",
    lineStrong: "#2f6a82",
    text: "#f6efe3",
    textSoft: "#c5d0cd",
    muted: "#8fabb2",
    accent: "#5eead4",
    accentFill: "#2dd4bf",
    amber: "#ffc857",
    coral: "#ff7a59",
    sky: "#6cc6ff",
    violet: "#c4a1ff",
    cyan: "#5eead4",
    good: "#5eead4",
    warn: "#ffc857",
    bad: "#ff7a59",
    far: "#0c2a3a",
    mid: "#0a1f2d",
    near: "#06131d",
    win: "#ffc857",
    glowA: "rgba(94,234,212,0.16)",
    glowB: "rgba(255,200,87,0.12)",
    chip: "rgba(94,234,212,0.10)",
    chipLine: "rgba(94,234,212,0.34)",
    fur: "#ff9f43", furDark: "#c4601a", belly: "#ffe3bd",
    ink: "#06131d",
  },
  // "Morning shift": same city, same minute of the day on the other side of the world.
  light: {
    name: "light",
    bg: "#fff5e2",
    skyTop: "#a9dde8",
    skyMid: "#d3eee9",
    skyLow: "#ffe6bf",
    surface: "#ffffff",
    surface2: "#fff0d6",
    line: "#ecd9b4",
    lineStrong: "#d2b985",
    text: "#10282f",
    textSoft: "#365860",
    muted: "#557077",
    accent: "#0f766e",
    accentFill: "#0f9488",
    amber: "#c47a00",
    coral: "#e0482a",
    sky: "#1d7fc4",
    violet: "#7c4dd6",
    cyan: "#0f766e",
    good: "#0f766e",
    warn: "#a16207",
    bad: "#c2371b",
    far: "#bcdad8",
    mid: "#8fbcbc",
    near: "#5e9396",
    win: "#fff4cf",
    glowA: "rgba(15,148,136,0.12)",
    glowB: "rgba(255,170,60,0.18)",
    chip: "rgba(15,118,110,0.08)",
    chipLine: "rgba(15,118,110,0.30)",
    fur: "#f28a1f", furDark: "#b4540f", belly: "#ffe9c8",
    ink: "#10282f",
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

export const REDUCED_MOTION = "@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}";

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

// Small seeded generator so every build draws the same city.
export function rng(seed = 1) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
export const r1 = (n) => Math.round(n * 10) / 10;
