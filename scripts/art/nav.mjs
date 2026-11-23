// Four small pill buttons with a glint that sweeps across.
import { THEMES, F, svgDoc, esc, save } from "./common.mjs";
const BTN = [
  ["portfolio", "PORTFOLIO", (c) => `<circle cx="0" cy="0" r="8" fill="none" stroke="${c}" stroke-width="1.8"/><ellipse cx="0" cy="0" rx="3.6" ry="8" fill="none" stroke="${c}" stroke-width="1.6"/><path d="M-8 0h16" stroke="${c}" stroke-width="1.6"/>`],
  ["resume", "RESUME", (c) => `<path d="M-6 -8h8l5 5v11h-13z" fill="none" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"/><path d="M-3 0h7M-3 4h7" stroke="${c}" stroke-width="1.6" stroke-linecap="round"/>`],
  ["linkedin", "LINKEDIN", (c) => `<rect x="-8" y="-8" width="16" height="16" rx="4" fill="none" stroke="${c}" stroke-width="1.8"/><path d="M-3.5 -1v5M-3.5 -4.4v.1M0 4v-5M0 1q0-2 3-2t2.5 3v3" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/>`],
  ["email", "EMAIL", (c) => `<rect x="-9" y="-6.5" width="18" height="13" rx="3" fill="none" stroke="${c}" stroke-width="1.8"/><path d="M-8 -5l8 6l8 -6" fill="none" stroke="${c}" stroke-width="1.8"/>`],
];
for (const t of Object.values(THEMES)) for (const [name, label, glyph] of BTN) {
  const w = 40 + label.length * 9.6 + 12, h = 44;
  const body = `<defs><clipPath id="cp"><rect width="${w}" height="${h}" rx="22"/></clipPath><linearGradient id="gl" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity="${t.name === "dark" ? 0.18 : 0.7}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
<g clip-path="url(#cp)"><rect width="${w}" height="${h}" fill="${t.surface2}"/><rect class="gl" x="-60" width="46" height="${h}" fill="url(#gl)" transform="skewX(-20)"/></g>
<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="21.5" fill="none" stroke="${t.lineStrong}"/>
<g transform="translate(26 22)">${glyph(t.accent)}</g>
<text x="46" y="27" font-family="${F.display}" font-weight="700" font-size="13" letter-spacing="1.4" fill="${t.text}">${label}</text>`;
  const css = `@keyframes gl{0%,60%{transform:translateX(0) skewX(-20deg)}100%{transform:translateX(${w + 80}px) skewX(-20deg)}}.gl{animation:gl 5s ease-in-out infinite}`;
  save("nav-" + name, t, svgDoc({ w: Math.round(w), h, theme: t, fonts: ["sg700"], body, css, title: label, desc: `${label} link` }));
}
