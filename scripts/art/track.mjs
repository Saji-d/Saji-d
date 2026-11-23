// Career track: the cat runs past four stations. Each sign pops as the cat passes.
import { THEMES, F, svgDoc, esc, r1, save, BASE_CSS } from "./common.mjs";
import { skyline } from "./city.mjs";
import { runningCat, CAT_CSS } from "../lib/cat.mjs";

const W = 1000, H = 200, G = 152, T = 12; // ground y, loop seconds
const STOPS = [
  { x: 120, name: "AIUB", sub: "BSc CSE, 3.91 CGPA", c: "sky" },
  { x: 370, name: "Ledgercross", sub: "May to Sep 2026", c: "amber" },
  { x: 620, name: "RemoteIntegrity", sub: "Oct 2026 to now", c: "coral" },
  { x: 870, name: "Lumifi Solutions", sub: "Nov 2026 to now", c: "accentFill", now: true },
];
const CAT_X0 = -150, CAT_X1 = 1150, CAT_REST = 60;

function track(t) {
  const dark = t.name === "dark";
  const city = skyline(t, { base: G, heightAt: () => 52, seed: 8, x0: -60, x1: 1060 });
  let css = "";
  const stations = STOPS.map((s, i) => {
    const tPass = ((s.x - CAT_X0) / (CAT_X1 - CAT_X0)) * T;
    const delay = r1(tPass - 0.25);
    const col = t[s.c];
    css += `.p${i}{animation-delay:${delay}s}`;
    const bw = 196, bh = 54, by = 20;
    return `<g>
<path d="M${s.x - 50} ${by + bh}V${G}M${s.x + 50} ${by + bh}V${G}" stroke="${t.lineStrong}" stroke-width="3"/>
<g class="pop p${i}"><rect x="${s.x - bw / 2}" y="${by}" width="${bw}" height="${bh}" rx="14" fill="${t.surface}" stroke="${col}" stroke-opacity=".8" stroke-width="1.6"/>
<circle cx="${s.x - bw / 2 + 20}" cy="${by + bh / 2}" r="6" fill="${col}"/>${s.now ? `<circle class="rg" cx="${s.x - bw / 2 + 20}" cy="${by + bh / 2}" r="6" fill="none" stroke="${col}" stroke-width="1.6"/>` : ""}
<text x="${s.x - bw / 2 + 36}" y="${by + 24}" font-family="${F.display}" font-weight="700" font-size="16" fill="${t.text}">${esc(s.name)}</text>
<text x="${s.x - bw / 2 + 36}" y="${by + 42}" font-family="${F.mono}" font-weight="500" font-size="11" fill="${t.muted}">${esc(s.sub)}</text></g>
<ellipse cx="${s.x}" cy="${G + 2}" rx="0" ry="0"/>
</g>`;
  }).join("");

  const ground = `<rect x="0" y="${G}" width="${W}" height="${H - G}" fill="${dark ? "#05101a" : "#6a9ea1"}"/><rect y="${G}" width="${W}" height="3" fill="${dark ? "#12303f" : "#4f8588"}"/><path d="M0 ${G + 26}H${W}" stroke="${dark ? "#f6efe3" : "#fff7e6"}" stroke-width="2" stroke-dasharray="26 22" opacity=".45" class="lane"/>`;
  const defs = `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.skyMid}"/><stop offset="1" stop-color="${t.skyLow}"/></linearGradient><clipPath id="cp"><rect width="${W}" height="${H}" rx="22"/></clipPath>`;
  const body = `<g clip-path="url(#cp)"><rect width="${W}" height="${H}" fill="url(#sky)"/>${city.svg}${ground}${stations}
<g transform="translate(0 ${G + 14})"><g class="runner"><g transform="translate(${CAT_REST} 0) scale(.95)">${runningCat(t)}</g></g></g></g>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="21.5" fill="none" stroke="${t.line}"/>`;
  const css2 = BASE_CSS + CAT_CSS + city.css + css + `
@keyframes run{from{transform:translateX(${CAT_X0 - CAT_REST}px)}to{transform:translateX(${CAT_X1 - CAT_REST}px)}}
.runner{animation:run ${T}s linear infinite}
@keyframes pop{0%{transform:scale(1)}3%{transform:scale(1.1)}8%,100%{transform:scale(1)}}
.pop{transform-box:fill-box;transform-origin:50% 100%;animation:pop ${T}s ease-out infinite}
.lane{animation:dash 1.2s linear infinite}`;
  return svgDoc({
    w: W, h: H, theme: t, fonts: ["sg700", "jb500"], defs, body, css: css2,
    title: "Career track",
    desc: "A ginger cat runs past four signposts along a city street: AIUB (BSc in Computer Science and Engineering, CGPA 3.91, finished April 2026), Ledgercross (May to September 2026), RemoteIntegrity (October 2026 to now) and Lumifi Solutions (November 2026 to now).",
  });
}
for (const t of Object.values(THEMES)) save("track", t, track(t));
