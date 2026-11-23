// Header: one city, two moods. Night shift (dark) and morning shift (light).
import { THEMES, F, svgDoc, esc, rng, r1, save, BASE_CSS } from "./common.mjs";
import { skyline } from "./city.mjs";
import { runningCat, CAT_CSS } from "../lib/cat.mjs";

const W = 1000, H = 440, BASE = 400;
const PHRASES = ["full-stack developer", "AI and voice systems", "ships from Dhaka, remote"];

function header(t) {
  const dark = t.name === "dark";
  const rand = rng(5);
  const heightAt = (x) => (x < 520 ? 70 + 20 * Math.sin(x / 70) : Math.min(185, 70 + (x - 520) * 0.4));
  const city = skyline(t, { heightAt, seed: 21 });

  // stars (night) / sun rays (morning)
  let sky = "";
  if (dark) {
    for (let i = 0; i < 70; i++) {
      const x = r1(rand() * W), y = r1(rand() * 250), r = r1(0.5 + rand() * 1.3);
      sky += `<circle class="st s${i % 4}" cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity="${r1(0.5 + rand() * 0.4)}"/>`;
    }
    sky += `<circle cx="722" cy="74" r="70" fill="url(#halo)"/><circle cx="722" cy="74" r="25" fill="#f6efe3"/><circle cx="733" cy="68" r="22" fill="#0a2230"/>`
      + `<g fill="#f6efe3" opacity=".9"><circle cx="684" cy="104" r="1.6" class="st s1"/><circle cx="760" cy="40" r="1.4" class="st s2"/></g>`;
  } else {
    let rays = "";
    for (let i = 0; i < 14; i++) rays += `<path d="M0 -42L7 -62L-7 -62z" fill="#ffb84a" transform="rotate(${i * 360 / 14})" opacity=".85"/>`;
    sky += `<circle cx="722" cy="78" r="90" fill="url(#halo)"/><g transform="translate(722 78)"><g class="sunr">${rays}</g></g><circle cx="722" cy="78" r="30" fill="#ffb02e"/><circle cx="722" cy="78" r="21" fill="#ffd36b"/>`;
  }

  // drifting clouds (two copies, 1000 apart, so the loop is seamless)
  const cloud = (x, y, s, o) => `<g transform="translate(${x} ${y}) scale(${s})" fill="${dark ? "#9fc6d6" : "#ffffff"}" opacity="${o}"><ellipse cx="0" cy="0" rx="34" ry="9"/><ellipse cx="-16" cy="-8" rx="18" ry="11"/><ellipse cx="8" cy="-12" rx="22" ry="14"/><ellipse cx="26" cy="-3" rx="16" ry="8"/></g>`;
  const clouds = (dx) => [cloud(120 + dx, 62, 1.1, dark ? 0.1 : 0.9), cloud(430 + dx, 150, 0.8, dark ? 0.07 : 0.7), cloud(800 + dx, 40, 0.9, dark ? 0.08 : 0.8), cloud(980 + dx, 170, 1.2, dark ? 0.08 : 0.75)].join("");
  sky += `<g class="cl">${clouds(0)}${clouds(1000)}</g>`;

  // flying paper plane with a dashed trail
  const plane = `<g class="plane"><path d="M-140 0H-14" stroke="${t.muted}" stroke-width="1.6" stroke-dasharray="3 7" opacity=".6"/><path d="M0 0L-20 -9L-14 0L-20 9Z" fill="${dark ? "#f6efe3" : "#ffffff"}" stroke="${t.muted}" stroke-width=".8"/><path d="M0 0L-14 0L-18 5Z" fill="${t.coral}" opacity=".9"/></g>`;

  // tall comms tower with pulsing signal rings
  const tw = 868;
  const tower = `<g><path d="M${tw - 22} ${BASE}V150h44V${BASE}z" fill="${t.mid}"/><path d="M${tw - 16} 150L${tw} 96L${tw + 16} 150z" fill="${t.mid}"/><path d="M${tw} 96V62" stroke="${t.mid}" stroke-width="3"/>`
    + `<path d="M${tw - 14} 172h4.4v6h-4.4zM${tw + 8} 172h4.4v6h-4.4zM${tw - 14} 196h4.4v6h-4.4zM${tw - 3} 220h4.4v6h-4.4zM${tw + 8} 244h4.4v6h-4.4zM${tw - 14} 268h4.4v6h-4.4z" fill="${t.win}" opacity=".9"/>`
    + `<circle cx="${tw}" cy="60" r="3.4" fill="${t.coral}" class="pu"/>`
    + [0, 0.87, 1.74].map((d) => `<circle class="rg" cx="${tw}" cy="60" r="12" fill="none" stroke="${t.accent}" stroke-width="1.6" style="animation-delay:-${d}s"/>`).join("") + `</g>`;

  // billboard with voice equalizer bars
  const bars = Array.from({ length: 13 }, (_, i) => {
    const h = [10, 18, 26, 14, 30, 22, 12, 28, 18, 32, 16, 24, 12][i];
    return `<rect class="eqb" x="${662 + i * 7.2}" y="${300 - h}" width="4.4" height="${h}" rx="2" fill="${i % 3 === 0 ? t.amber : t.accent}" style="animation-delay:-${r1((i * 0.37) % 1.1)}s;animation-duration:${r1(0.9 + (i % 4) * 0.18)}s"/>`;
  }).join("");
  const board = `<g><path d="M672 316V296M744 316V296" stroke="${t.near}" stroke-width="4"/><rect x="650" y="258" width="108" height="46" rx="6" fill="${dark ? "#041018" : "#10282f"}" stroke="${t.lineStrong}"/>${bars}</g>`;

  // floating code glyphs
  const glyph = (x, y, s, c, d) => `<text class="gl" x="${x}" y="${y}" font-family="${F.mono}" font-weight="500" font-size="15" fill="${c}" style="animation-delay:-${d}s">${esc(s)}</text>`;
  const glyphs = glyph(790, 190, "{ }", t.accent, 0) + glyph(930, 150, "</>", t.amber, 3) + glyph(640, 218, "0x", t.sky, 6) + glyph(960, 238, "AI", t.coral, 9);

  // street + lamps
  const lamp = (x) => `<g><path d="M${x} ${BASE + 6}V${BASE - 34}h12" stroke="${t.near}" stroke-width="2.4" fill="none"/><path d="M${x + 4} ${BASE - 32}h16l8 38h-32z" fill="url(#cone)" opacity="${dark ? .55 : 0}"/><circle cx="${x + 12}" cy="${BASE - 33}" r="3.4" fill="${t.amber}" class="pu"/></g>`;
  const lamps = [90, 330, 560, 800, 960].map(lamp).join("");
  const road = `<rect x="0" y="${BASE}" width="${W}" height="${H - BASE}" fill="${dark ? "#05101a" : "#6a9ea1"}"/><rect x="0" y="${BASE}" width="${W}" height="3" fill="${dark ? "#12303f" : "#4f8588"}"/><path d="M0 ${BASE + 28}H${W}" stroke="${dark ? "#f6efe3" : "#fff7e6"}" stroke-width="2" stroke-dasharray="26 22" opacity=".45" class="lane"/>`;

  // terminal-style role line
  const ty = 214, tx = 52, fs = 22, cw = fs * 0.6;
  const phrase = (p, i) => {
    const w = p.length * cw;
    return `<text class="ty ty${i}" x="${tx + 20}" y="${ty}" font-family="${F.mono}" font-weight="500" font-size="${fs}" fill="${dark ? t.text : t.ink}"${i ? ' opacity="0"' : ""}>${esc(p)}</text>`
      + `<rect class="cu cu${i}" x="${r1(tx + 20 + w + 3)}" y="${ty - 18}" width="11" height="23" fill="${t.accentFill}"${i ? ' opacity="0"' : ""}/>`;
  };
  const cycle = 18, slot = cycle / PHRASES.length;
  let tcss = "";
  PHRASES.forEach((p, i) => {
    const w = p.length * cw;
    tcss += `.ty${i}{animation:tyk ${cycle}s steps(${p.length}) ${i * slot}s infinite}`
      + `.cu${i}{animation:cuk${i} ${cycle}s steps(${p.length}) ${i * slot}s infinite}`
      + `@keyframes cuk${i}{0%{transform:translateX(${-r1(w)}px);opacity:1}14%{transform:translateX(0);opacity:1}30%{transform:translateX(0);opacity:1}31%,100%{transform:translateX(0);opacity:0}}`;
  });
  tcss += `@keyframes tyk{0%{clip-path:inset(0 100% 0 0);opacity:1}14%{clip-path:inset(0 0 0 0)}30%{clip-path:inset(0 0 0 0);opacity:1}31%,100%{clip-path:inset(0 0 0 0);opacity:0}}`;

  const pills = (() => {
    const h = 30;
    const g = `<g transform="translate(52 252)"><rect width="158" height="${h}" rx="15" fill="${dark ? "rgba(94,234,212,.12)" : "rgba(15,118,110,.10)"}" stroke="${t.accent}" stroke-opacity=".7"/><circle cx="17" cy="15" r="4" fill="${t.accentFill}"/><circle class="rg" cx="17" cy="15" r="4" fill="none" stroke="${t.accentFill}" stroke-width="1.4"/><text x="30" y="19.5" font-family="${F.mono}" font-weight="500" font-size="12" letter-spacing="1.4" fill="${t.accent}">OPEN TO WORK</text></g>`
      + `<g transform="translate(222 252)"><rect width="238" height="${h}" rx="15" fill="none" stroke="${t.lineStrong}"/><text x="14" y="19.5" font-family="${F.mono}" font-weight="500" font-size="12" letter-spacing="1" fill="${t.textSoft}">UTC+6 · REMOTE FOR AU</text></g>`;
    return g;
  })();

  const defs = `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.skyTop}"/><stop offset=".6" stop-color="${t.skyMid}"/><stop offset="1" stop-color="${t.skyLow}"/></linearGradient>
<radialGradient id="halo"><stop offset="0" stop-color="${dark ? "#cfe9ff" : "#ffcf66"}" stop-opacity="${dark ? 0.28 : 0.55}"/><stop offset="1" stop-color="${dark ? "#cfe9ff" : "#ffcf66"}" stop-opacity="0"/></radialGradient>
<linearGradient id="cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.amber}" stop-opacity=".28"/><stop offset="1" stop-color="${t.amber}" stop-opacity="0"/></linearGradient>
<linearGradient id="nm" x1="0" x2="1"><stop offset="0" stop-color="${dark ? "#fff7e6" : t.ink}"/><stop offset="1" stop-color="${dark ? t.accent : "#0f766e"}"/></linearGradient>
<clipPath id="cp"><rect width="${W}" height="${H}" rx="22"/></clipPath>`;

  const body = `<g clip-path="url(#cp)"><rect width="${W}" height="${H}" fill="url(#sky)"/>${sky}${plane}${city.svg}${tower}${board}${glyphs}${road}${lamps}
<g transform="translate(0 ${BASE + 12})"><g class="runner"><g transform="translate(760 0) scale(1.12)">${runningCat(t)}</g></g></g></g>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="21.5" fill="none" stroke="${t.line}"/>
<text x="50" y="86" font-family="${F.mono}" font-weight="500" font-size="13" letter-spacing="2.4" fill="${t.accent}">HELLO WORLD, I AM</text>
<text x="48" y="150" font-family="${F.display}" font-weight="700" font-size="58" letter-spacing="-1.5" fill="url(#nm)">Sajidur Rahman Sajid</text>
<text x="${tx}" y="${ty}" font-family="${F.mono}" font-weight="500" font-size="${fs}" fill="${t.coral}">$</text>
${PHRASES.map(phrase).join("")}
${pills}`;

  const css = BASE_CSS + CAT_CSS + city.css + tcss + `
@keyframes tw{0%,100%{opacity:.25}50%{opacity:1}}
.st{animation:tw 3s ease-in-out infinite}.s1{animation-delay:-.7s;animation-duration:4s}.s2{animation-delay:-1.4s;animation-duration:2.4s}.s3{animation-delay:-2.2s;animation-duration:5s}
@keyframes cl{from{transform:translateX(0)}to{transform:translateX(-1000px)}}
.cl{animation:cl 120s linear infinite}
@keyframes plane{from{transform:translate(1180px,38px)}to{transform:translate(-120px,26px)}}
.plane{transform:translate(520px,34px);animation:plane 24s linear infinite}
@keyframes run{from{transform:translateX(-1000px)}to{transform:translateX(280px)}}
.runner{animation:run 11s linear infinite}
.lane{animation:dash 1.2s linear infinite}
@keyframes gl{0%{transform:translateY(14px);opacity:0}20%{opacity:.8}80%{opacity:.7}100%{transform:translateY(-34px);opacity:0}}
.gl{animation:gl 12s ease-in-out infinite}
.sunr{animation:spin 60s linear infinite}`;

  return svgDoc({
    w: W, h: H, theme: t, fonts: ["sg700", "jb500"], defs, body, css,
    title: "Sajidur Rahman Sajid, full-stack developer",
    desc: dark
      ? "Animated night skyline of a city with blinking windows, a signal tower, a voice equalizer billboard and a ginger cat in a headset and backpack running along the street. The name Sajidur Rahman Sajid with a typing line: full-stack developer, AI and voice systems, ships from Dhaka. Open to work."
      : "Animated morning skyline of a city with drifting clouds, a signal tower, a voice equalizer billboard and a ginger cat in a headset and backpack running along the street. The name Sajidur Rahman Sajid with a typing line: full-stack developer, AI and voice systems, ships from Dhaka. Open to work.",
  });
}

for (const t of Object.values(THEMES)) save("header", t, header(t));
