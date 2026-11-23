// Procedural skyline: three parallax layers with blinking windows.
// Same seed gives the same city in both themes (night / morning).
import { rng, r1 } from "./common.mjs";

// heightAt(x) -> max building height at x. Returns { css, svg }.
export function skyline(t, { x0 = -60, x1 = 1060, base = 400, heightAt, seed = 11, windows = true }) {
  const rand = rng(seed);
  const layers = [
    { id: "far", color: t.far, minW: 30, maxW: 64, hMul: 1.18, hMin: 24, gap: 0, op: 1, win: false },
    { id: "mid", color: t.mid, minW: 34, maxW: 74, hMul: 1.0, hMin: 20, gap: 3, op: 1, win: true },
    { id: "near", color: t.near, minW: 52, maxW: 110, hMul: 0.62, hMin: 18, gap: 6, op: 1, win: true },
  ];
  let svg = "";
  const lf = t.win, op = t.name === "dark" ? 0.92 : 0.95;
  for (const L of layers) {
    const lit = [[], [], [], [], [], []]; // blink groups
    const steady = [];
    let x = x0 + rand() * 20;
    let body = "";
    const roofs = [];
    while (x < x1) {
      const w = Math.round(L.minW + rand() * (L.maxW - L.minW));
      const h = Math.round(Math.max(L.hMin, heightAt(x + w / 2) * L.hMul * (0.65 + rand() * 0.6)));
      body += `M${r1(x)} ${base}V${base - h}h${w}V${base}z`;
      if (rand() < 0.35 && h > 40) body += `M${r1(x + w * 0.3)} ${base - h}v-${6 + Math.round(rand() * 9)}h${r1(w * 0.12)}v${6 + 0}z`; // roof box
      roofs.push({ x, w, h });
      if (L.win && windows) {
        const cols = Math.floor((w - 8) / 9);
        const rows = Math.floor((h - 12) / 12);
        for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
          const v = rand();
          const wx = r1(x + 5 + c * 9 + (w - 8 - cols * 9) / 2), wy = base - h + 8 + r * 12;
          const d = `M${wx} ${wy}h4.4v6.2h-4.4z`;
          if (L.id === "near" && rand() < 0.2) continue;
          if (v < 0.5) steady.push(d);
          else if (v < 0.75) lit[Math.floor(rand() * 6)].push(d);
        }
      }
      x += w + L.gap + Math.round(rand() * 6);
    }
    let win = steady.length ? `<path d="${steady.join("")}" fill="${lf}" opacity="${op}"/>` : "";
    lit.forEach((g, i) => { if (g.length) win += `<path class="wk w${i}" d="${g.join("")}" fill="${lf}" opacity="${op}"/>`; });
    svg += `<g class="sk-${L.id}"><path d="${body}" fill="${L.color}"/>${win}</g>`;
  }
  const css = `
.wk{animation:blink 5s ease-in-out infinite}
.w0{animation-duration:4.2s;animation-delay:-.4s}.w1{animation-duration:6.1s;animation-delay:-2s}.w2{animation-duration:3.3s;animation-delay:-1s}
.w3{animation-duration:7.3s;animation-delay:-3.4s}.w4{animation-duration:5.2s;animation-delay:-4.2s}.w5{animation-duration:4.7s;animation-delay:-2.6s}
@keyframes sw1{from{transform:translateX(0)}to{transform:translateX(-26px)}}
@keyframes sw2{from{transform:translateX(0)}to{transform:translateX(-52px)}}
.sk-far{animation:sw1 18s ease-in-out infinite alternate}
.sk-mid{animation:sw2 18s ease-in-out infinite alternate}
`;
  return { css, svg };
}
