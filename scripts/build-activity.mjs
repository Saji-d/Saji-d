#!/usr/bin/env node
// Renders an isometric contribution chart (assets/activity-{dark,light}.svg)
// from the GitHub GraphQL API. No dependencies.
//   GITHUB_TOKEN=... node scripts/build-activity.mjs [login]
//   node scripts/build-activity.mjs --demo     (synthetic data, no network)
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { THEMES, ROOT, FONT_STACK as F, svgDoc, esc } from "./lib/kit.mjs";

const args = process.argv.slice(2);
const demo = args.includes("--demo");
const login = args.find((a) => !a.startsWith("--")) || process.env.GITHUB_REPOSITORY_OWNER || "Saji-d";

async function fetchCalendar() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is not set");
  const query = `query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{date contributionCount}}}}}}`;
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${token}`, "Content-Type": "application/json", "User-Agent": "profile-readme-activity" },
    body: JSON.stringify({ query, variables: { login } }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) throw new Error("GraphQL error: " + JSON.stringify(json.errors ?? res.status));
  const c = json.data.user.contributionsCollection.contributionCalendar;
  return { total: c.totalContributions, weeks: c.weeks.map((w) => w.contributionDays) };
}

function demoCalendar() {
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const weeks = [];
  const start = new Date(Date.UTC(2025, 10, 23));
  let total = 0;
  for (let w = 0; w < 53; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      const n = rnd() < 0.35 ? 0 : Math.floor(rnd() ** 2 * 14);
      total += n;
      days.push({ date: new Date(start.getTime() + (w * 7 + d) * 864e5).toISOString().slice(0, 10), contributionCount: n });
    }
    weeks.push(days);
  }
  return { total, weeks };
}

function stats(cal) {
  const days = cal.weeks.flat();
  const today = new Date().toISOString().slice(0, 10);
  let best = 0, run = 0, busiest = { contributionCount: 0, date: "" };
  for (const d of days) {
    if (d.contributionCount > 0) { run++; best = Math.max(best, run); } else run = 0;
    if (d.contributionCount > busiest.contributionCount) busiest = d;
  }
  // current streak: walk back from the latest day, allowing today to be empty
  let cur = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].contributionCount > 0) cur++;
    else if (days[i].date === today && cur === 0) continue;
    else break;
  }
  return { best, cur, busiest };
}

function render(t, cal, s) {
  // Oblique projection: one step along a week is U, one step down a day is V.
  const U = [15, 4], V = [-6.5, 8.5];
  const nz = cal.weeks.flat().map((d) => d.contributionCount).filter((n) => n > 0).sort((a, b) => a - b);
  const cap = Math.max(1, nz[Math.floor(nz.length * 0.95)] ?? 1);
  const hOf = (n) => (n === 0 ? 0 : 3 + Math.min(1, n / cap) ** 0.65 * 66);
  const q = (p) => nz[Math.min(nz.length - 1, Math.floor(nz.length * p))] ?? 1;
  const cuts = [q(0.35), q(0.7), q(0.93)];
  const lvl = (n) => (n === 0 ? 0 : 1 + cuts.filter((c) => n > c).length);
  const levels = t.name === "dark"
    ? [["#2a2c52", "#1f2142", "#171934"], ["#4a4fc0", "#3a3ea0", "#2c3080"], ["#6366f1", "#4f52d0", "#3d40a8"], ["#a855f7", "#8a3fd6", "#6d31ac"], ["#22d3ee", "#19aac4", "#1383a0"]]
    : [["#dfe1f6", "#cfd2ee", "#bfc3e4"], ["#a5b4fc", "#8f9ff0", "#7a8add"], ["#6366f1", "#5254d6", "#4244b5"], ["#a855f7", "#9140de", "#7a32bd"], ["#0e7490", "#0b6079", "#084d61"]];
  const nW = cal.weeks.length;
  const W = 1000, H = 480;
  const x0 = (W - nW * U[0]) / 2 + 3 * -V[0] / 2 + 10, y0 = 112;
  const cells = [];
  cal.weeks.forEach((days, w) => days.forEach((day, d) => cells.push({ w, d, n: day.contributionCount, x: x0 + w * U[0] + d * V[0], y: y0 + w * U[1] + d * V[1] })));
  cells.sort((a, b) => a.y - b.y || a.x - b.x);
  const r = (v) => Math.round(v * 10) / 10;
  const [ux, uy] = U, [vx, vy] = V;
  let flat = "", bars = "";
  for (const { n, x, y } of cells) {
    if (n === 0) { flat += `M${r(x)} ${r(y)}l${ux} ${uy}l${vx} ${vy}l${-ux} ${-uy}z`; continue; }
    const [top, left, right] = levels[lvl(n)];
    const h = r(hOf(n)), yt = y - h;
    // faces visible to the viewer: edge D-C (front-left) and edge B-C (front-right)
    bars += `<path fill="${left}" d="M${r(x + vx)} ${r(yt + vy)}l${ux} ${uy}v${h}l${-ux} ${-uy}z"/>`
      + `<path fill="${right}" d="M${r(x + ux)} ${r(yt + uy)}l${vx} ${vy}v${h}l${-vx} ${-vy}z"/>`
      + `<path fill="${top}" d="M${r(x)} ${r(yt)}l${ux} ${uy}l${vx} ${vy}l${-ux} ${-uy}z"/>`;
  }
  const stat = (x, v, label) => `<text x="${x}" y="${H - 58}" font-family="${F.display}" font-weight="700" font-size="34" letter-spacing="-.6" fill="${t.text}">${esc(v)}</text><text x="${x}" y="${H - 34}" font-family="${F.mono}" font-weight="500" font-size="12" fill="${t.muted}">${esc(label)}</text>`;
  const busy = s.busiest.date ? new Date(s.busiest.date + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }) : "";
  const body = `<rect width="${W}" height="${H}" rx="22" fill="${t.bg}"/><rect width="${W}" height="${H}" rx="22" fill="url(#ga)"/><rect width="${W}" height="${H}" rx="22" fill="url(#gb)"/>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="21.5" fill="none" stroke="${t.lineStrong}"/>
<text x="36" y="46" font-family="${F.mono}" font-weight="500" font-size="12" letter-spacing="1.3" fill="${t.accent}">LAST 12 MONTHS ON GITHUB</text>
<g class="in"><path fill="${levels[0][0]}" d="${flat}"/>${bars}</g>
${stat(36, cal.total.toLocaleString("en-US"), "contributions")}
${stat(250, s.best + (s.best === 1 ? " day" : " days"), "longest streak")}
${stat(450, s.cur + (s.cur === 1 ? " day" : " days"), "current streak")}
${s.busiest.contributionCount ? stat(650, String(s.busiest.contributionCount), "busiest day, " + busy) : ""}`;
  const defs = `<radialGradient id="ga" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(0 0) rotate(35) scale(520 380)"><stop offset="0" stop-color="${t.glowA}"/><stop offset="1" stop-color="${t.glowA}" stop-opacity="0"/></radialGradient>
<radialGradient id="gb" cx="1000" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1000 0) rotate(140) scale(480 360)"><stop offset="0" stop-color="${t.glowB}"/><stop offset="1" stop-color="${t.glowB}" stop-opacity="0"/></radialGradient>`;
  return svgDoc({
    w: W, h: H, theme: t, fonts: ["sg700", "jb500"], defs, body,
    css: ".in{animation:in 1.2s ease-out both}@keyframes in{from{opacity:0}}",
    title: `GitHub activity for ${login}`,
    desc: `${cal.total} contributions in the last year. Longest streak ${s.best} days, current streak ${s.cur} days. Busiest day ${s.busiest.contributionCount} contributions.`,
  });
}

const cal = demo ? demoCalendar() : await fetchCalendar();
const s = stats(cal);
mkdirSync(join(ROOT, "assets"), { recursive: true });
for (const t of Object.values(THEMES)) {
  const svg = render(t, cal, s);
  writeFileSync(join(ROOT, "assets", `activity-${t.name}.svg`), svg);
  console.log(`activity-${t.name}.svg ${(svg.length / 1024).toFixed(1)} KB`);
}
