import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { THEMES, ROOT, FONT_STACK as F, ICONS, esc, textWidth, svgDoc, imageDataUri, rng, r1 } from "../lib/kit.mjs";
export { THEMES, ROOT, F, ICONS, esc, textWidth, svgDoc, imageDataUri, rng, r1 };

export const OUT = join(ROOT, "assets");
mkdirSync(OUT, { recursive: true });

export function save(name, t, svg) {
  writeFileSync(join(OUT, `${name}-${t.name}.svg`), svg);
  console.log(`${name}-${t.name}.svg  ${(svg.length / 1024).toFixed(1)} KB`);
}

export const icon = (key, x, y, size, fill) =>
  `<g transform="translate(${r1(x)} ${r1(y)}) scale(${r1(size / 24 * 100) / 100})"><path d="${ICONS[key]}" fill="${fill}"/></g>`;

// [dark, light] brand colours; null means "use the text colour"
export const BRAND = {
  python: ["#ffd43b", "#3776ab"], typescript: ["#4aa3f0", "#2f74c0"], javascript: ["#f7df1e", "#a88900"],
  kotlin: ["#b184ff", "#7f52ff"], cplusplus: ["#5cb3f0", "#00599c"], react: ["#61dafb", "#0e86a8"],
  nextdotjs: null, tailwindcss: ["#38bdf8", "#0891b2"], jetpackcompose: ["#6ea1ff", "#3b6fd8"], android: ["#3ddc84", "#1b9a55"],
  fastapi: ["#12c3ae", "#009688"], fastify: null, nodedotjs: ["#7bc66b", "#3f8a2f"], nestjs: ["#ff4d78", "#e0234e"],
  express: null, postgresql: ["#6aa5dc", "#336791"], prisma: ["#8e9bff", "#4b56c4"], redis: ["#ff6b5e", "#d82c20"],
  mongodb: ["#5fc060", "#2f8f3a"], pytorch: ["#ff7a4d", "#ee4c2c"], scikitlearn: ["#ffa94d", "#d9780f"],
  huggingface: ["#ffd21e", "#b88700"], opencv: ["#8f7bff", "#5c3ee8"], pandas: ["#b79cff", "#7248c9"],
  streamlit: ["#ff6b6b", "#e0383e"], docker: ["#3aa8ff", "#1d77c9"], git: ["#ff6a4d", "#d9381e"],
  vercel: null, twilio: ["#ff5a6e", "#e0243c"],
};
export const brand = (key, t) => {
  const b = BRAND[key];
  return b ? b[t.name === "dark" ? 0 : 1] : t.text;
};

// common SVG snippets
export const panel = (w, h, t, rx = 22) =>
  `<rect width="${w}" height="${h}" rx="${rx}" fill="${t.surface}"/>`;
export const frame = (w, h, t, rx = 22) =>
  `<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="${rx - .5}" fill="none" stroke="${t.line}"/>`;

export const pill = (x, y, label, { color, dot, t, h = 26, size = 11.5, fill }) => {
  const w = 22 + (dot ? 14 : 0) + Math.ceil(label.length * (size * 0.6 + 1.1));
  return {
    w,
    svg: `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${fill ?? "none"}" stroke="${color}" stroke-opacity=".6"/>${dot ? `<circle cx="${x + 15}" cy="${y + h / 2}" r="3.4" fill="${color}"/>` : ""}<text x="${x + 11 + (dot ? 14 : 0)}" y="${y + h / 2 + 4}" font-family="${F.mono}" font-weight="500" font-size="${size}" letter-spacing="1.1" fill="${color}">${esc(label)}</text>`,
  };
};

export const BASE_CSS = `
@keyframes pulse{0%,100%{opacity:.35}50%{opacity:1}}
@keyframes blink{0%,100%{opacity:1}45%,55%{opacity:.12}}
@keyframes ring{0%{transform:scale(.4);opacity:.9}100%{transform:scale(2.6);opacity:0}}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes eq{0%,100%{transform:scaleY(.35)}50%{transform:scaleY(1)}}
@keyframes marq{from{transform:translateX(0)}to{transform:translateX(-1000px)}}
@keyframes marqr{from{transform:translateX(-1000px)}to{transform:translateX(0)}}
@keyframes dash{to{stroke-dashoffset:-48}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes glint{0%,70%{transform:translateX(-120px)}100%{transform:translateX(420px)}}
.pu{animation:pulse 2.4s ease-in-out infinite}
.eqb{transform-box:fill-box;transform-origin:50% 100%;animation:eq 1.1s ease-in-out infinite}
.rg{transform-box:fill-box;transform-origin:center;animation:ring 2.6s ease-out infinite}
.fl{animation:bob 4s ease-in-out infinite}
`;
