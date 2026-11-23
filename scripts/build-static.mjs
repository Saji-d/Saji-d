#!/usr/bin/env node
// Generates the hand-designed SVGs (header, project cards, stack, footer) for
// both themes. Output goes to assets/. Run: node scripts/build-static.mjs
// No dependencies. Fonts and screenshots are embedded as data URIs so GitHub's
// image proxy renders them without any outside request.
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { THEMES, ROOT, FONT_STACK as F, ICONS, esc, textWidth, svgDoc, imageDataUri } from "./lib/kit.mjs";

const OUT = join(ROOT, "assets");
mkdirSync(OUT, { recursive: true });

const save = (name, theme, svg) => {
  const file = join(OUT, `${name}-${theme}.svg`);
  writeFileSync(file, svg);
  console.log(`${name}-${theme}.svg  ${(svg.length / 1024).toFixed(1)} KB`);
};

// ---------- shared pieces ----------
const icon = (key, x, y, size, fill) =>
  `<g transform="translate(${x} ${y}) scale(${size / 24})"><path d="${ICONS[key]}" fill="${fill}"/></g>`;

function chip(t, x, y, label, { ic, size = 13, h = 28 } = {}) {
  const pad = 11;
  const iw = ic ? size + 6 : 0;
  const w = pad * 2 + iw + textWidth(label, size, "sans");
  const g = `<g>
<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${t.chip}" stroke="${t.chipLine}"/>
${ic ? icon(ic, x + pad, y + (h - size) / 2, size, t.accent) : ""}
<text x="${x + pad + iw}" y="${y + h / 2 + size * 0.36}" font-family="${F.sans}" font-weight="600" font-size="${size}" fill="${t.text}">${esc(label)}</text>
</g>`;
  return { svg: g, w };
}

function chipRow(t, x, y, items, gap = 8) {
  let cx = x;
  let out = "";
  for (const it of items) {
    const c = chip(t, cx, y, it.label, { ic: it.ic });
    out += c.svg;
    cx += c.w + gap;
  }
  return out;
}

function tag(t, x, y, label, { color, dot } = {}) {
  const size = 11.5;
  const c = color ?? t.accent;
  const w = 20 + textWidth(label, size, "mono") + label.length * 1.1 + (dot ? 14 : 0);
  return {
    w,
    svg: `<rect x="${x}" y="${y}" width="${w}" height="24" rx="12" fill="none" stroke="${c}" stroke-opacity="0.55"/>
${dot ? `<circle cx="${x + 14}" cy="${y + 12}" r="3.4" fill="${t.good}"/>` : ""}
<text x="${x + 10 + (dot ? 14 : 0)}" y="${y + 16}" font-family="${F.mono}" font-weight="500" font-size="${size}" letter-spacing="1.1" fill="${c}">${esc(label)}</text>`,
  };
}

const bgGlow = (t, id = "g") => `
<radialGradient id="${id}a" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(0 0) rotate(35) scale(520 380)"><stop offset="0" stop-color="${t.glowA}"/><stop offset="1" stop-color="${t.glowA}" stop-opacity="0"/></radialGradient>
<radialGradient id="${id}b" cx="1000" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1000 0) rotate(140) scale(480 360)"><stop offset="0" stop-color="${t.glowB}"/><stop offset="1" stop-color="${t.glowB}" stop-opacity="0"/></radialGradient>`;

// ---------- header ----------
function header(t) {
  const W = 1000, H = 330;
  const bars = [];
  const heights = [10, 18, 30, 22, 40, 56, 34, 62, 44, 28, 50, 70, 46, 24, 38, 58, 32, 20, 44, 64, 40, 26, 16, 30, 22, 12];
  heights.forEach((hh, i) => {
    const x = 690 + i * 11.4;
    const d = ((i * 0.37) % 1.6).toFixed(2);
    bars.push(`<rect class="bar" style="animation-delay:-${d}s" x="${x.toFixed(1)}" y="${(262 - hh / 2).toFixed(1)}" width="6" height="${hh}" rx="3" fill="url(#wave)"/>`);
  });
  const css = `
.fade{animation:fade .9s ease-out both}
.f1{animation-delay:.15s}.f2{animation-delay:.45s}.f3{animation-delay:.7s}.f4{animation-delay:.95s}
@keyframes fade{from{opacity:0;transform:translateY(10px)}}
.type{animation:type 1.3s steps(28,end) .1s both}
@keyframes type{from{clip-path:inset(0 100% 0 0)}to{clip-path:inset(0 0 0 0)}}
.caret{animation:blink 1.1s steps(1) infinite}
@keyframes blink{50%{opacity:0}}
.bar{transform-box:fill-box;transform-origin:center;animation:eq 1.9s ease-in-out infinite}
@keyframes eq{0%,100%{transform:scaleY(1)}50%{transform:scaleY(.42)}}`;
  const body = `
<rect width="${W}" height="${H}" rx="22" fill="${t.bg}"/>
<rect width="${W}" height="${H}" rx="22" fill="url(#ga)"/>
<rect width="${W}" height="${H}" rx="22" fill="url(#gb)"/>
<rect width="${W}" height="${H}" rx="22" fill="url(#dots)"/>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="21.5" fill="none" stroke="${t.lineStrong}"/>
<g class="type"><text x="48" y="64" font-family="${F.mono}" font-weight="500" font-size="15" fill="${t.muted}"><tspan fill="${t.accent}">~/saji-d</tspan> $ whoami</text></g>
<rect class="caret" x="206" y="51" width="8" height="16" fill="${t.accent}"/>
<text class="fade f1" x="46" y="150" font-family="${F.display}" font-weight="700" font-size="68" letter-spacing="-1.6" fill="url(#name)">Sajidur Rahman Sajid</text>
<text class="fade f2" x="48" y="198" font-family="${F.sans}" font-weight="600" font-size="27" fill="${t.text}">Full-Stack Developer <tspan fill="${t.accent}">&amp;</tspan> AI Engineer</text>
<g class="fade f3" font-family="${F.mono}" font-weight="500" font-size="15">
<text x="48" y="236" fill="${t.textSoft}">Now at <tspan fill="${t.text}">Lumifi Solutions</tspan> <tspan fill="${t.muted}">(AU)</tspan>  +  <tspan fill="${t.text}">RemoteIntegrity</tspan> <tspan fill="${t.muted}">(US)</tspan></text>
<text x="48" y="262" fill="${t.muted}">Dhaka, Bangladesh  ·  UTC+6  ·  remote-first</text>
</g>
<g class="fade f4">
<rect x="48" y="282" width="150" height="30" rx="15" fill="${t.chip}" stroke="${t.good}" stroke-opacity=".7"/>
<circle cx="68" cy="297" r="4" fill="${t.good}"><animate attributeName="opacity" values="1;.35;1" dur="2.4s" repeatCount="indefinite"/></circle>
<circle cx="68" cy="297" r="4" fill="none" stroke="${t.good}"><animate attributeName="r" values="4;11" dur="2.4s" repeatCount="indefinite"/><animate attributeName="opacity" values=".8;0" dur="2.4s" repeatCount="indefinite"/></circle>
<text x="82" y="302" font-family="${F.sans}" font-weight="600" font-size="14" fill="${t.text}">Open to work</text>
</g>
<g>${bars.join("")}</g>
<text x="690" y="318" font-family="${F.mono}" font-weight="500" font-size="11.5" letter-spacing="1" fill="${t.muted}">YOUR WORDS, A DIFFERENT VOICE</text>`;
  const defs = `${bgGlow(t)}
<linearGradient id="name" x1="0" x2="1"><stop offset="0" stop-color="${t.nameFrom}"/><stop offset="1" stop-color="${t.nameTo}"/></linearGradient>
<linearGradient id="wave" x1="0" x2="1"><stop offset="0" stop-color="${t.accentFill}"/><stop offset=".6" stop-color="${t.violet}"/><stop offset="1" stop-color="${t.cyan}"/></linearGradient>
<pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="${t.dot}"/></pattern>`;
  return svgDoc({
    w: W, h: H, theme: t, fonts: ["sg700", "in600", "jb500"], css, body, defs,
    title: "Sajidur Rahman Sajid, Full-Stack Developer and AI Engineer",
    desc: "Now at Lumifi Solutions and RemoteIntegrity. Based in Dhaka, Bangladesh. Open to work.",
  });
}

// ---------- card building blocks ----------
function metric(t, x, y, value, label) {
  return `<text x="${x}" y="${y}" font-family="${F.display}" font-weight="700" font-size="30" fill="${t.text}" letter-spacing="-.5">${esc(value)}</text>
<text x="${x}" y="${y + 20}" font-family="${F.mono}" font-weight="500" font-size="12" fill="${t.muted}">${esc(label)}</text>`;
}

function cardShell(t, W, H, inner, defs = "") {
  return {
    body: `<rect width="${W}" height="${H}" rx="20" fill="${t.surface}"/>
<rect width="${W}" height="${H}" rx="20" fill="url(#ga)"/>
<rect width="${W}" height="${H}" rx="20" fill="url(#gb)"/>
${inner}
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="19.5" fill="none" stroke="${t.lineStrong}"/>`,
    defs: bgGlow(t) + defs,
  };
}

const cardCss = (t) => `.lift{animation:rise .8s ease-out both}@keyframes rise{from{opacity:0;transform:translateY(8px)}}`;

// ---------- VoiceCon (wide) ----------
function cardVoiceCon(t) {
  const W = 1000, H = 410;
  const img = imageDataUri("src/img/voicecon.jpg");
  const tg1 = tag(t, 40, 34, "FEATURED");
  const tg2 = tag(t, 40 + tg1.w + 8, 34, "LIVE  voicecon.app", { color: t.good, dot: true });
  const inner = `
${tg1.svg}${tg2.svg}
<text x="40" y="112" font-family="${F.display}" font-weight="700" font-size="56" letter-spacing="-1.2" fill="${t.text}">VoiceCon</text>
<text x="40" y="150" font-family="${F.sans}" font-weight="400" font-size="19" fill="${t.textSoft}">Live voice conversion over a normal phone call.</text>
<text x="40" y="175" font-family="${F.sans}" font-weight="400" font-size="19" fill="${t.textSoft}">Android app, billing API, realtime gateway, GPU worker.</text>
${metric(t, 40, 224, "86 ms", "inference p50")}
${metric(t, 168, 224, "~0.5 s", "server-side delay")}
${metric(t, 326, 224, "0 ms", "audio dropped")}
${metric(t, 456, 224, "336", "backend tests")}
<rect x="40" y="276" width="500" height="58" rx="12" fill="${t.surface2}" stroke="${t.line}"/>
<rect x="40" y="276" width="4" height="58" rx="2" fill="${t.accentFill}"/>
<text x="60" y="299" font-family="${F.mono}" font-weight="500" font-size="11.5" letter-spacing="1.2" fill="${t.accent}">FAILS CLOSED</text>
<text x="60" y="321" font-family="${F.sans}" font-weight="400" font-size="14.5" fill="${t.text}">Any conversion error ends the call. Raw audio is never forwarded.</text>
${chipRow(t, 40, 356, [
    { label: "Kotlin", ic: "kotlin" }, { label: "Fastify", ic: "fastify" }, { label: "PostgreSQL", ic: "postgresql" },
    { label: "Twilio", ic: "twilio" }, { label: "PyTorch", ic: "pytorch" },
  ])}
<g clip-path="url(#frame)">
<image href="${img}" x="570" y="30" width="400" height="350" preserveAspectRatio="xMidYMid slice"/>
<rect x="570" y="30" width="400" height="350" fill="url(#fadeL)"/>
</g>
<rect x="570.5" y="30.5" width="399" height="349" rx="16" fill="none" stroke="${t.lineStrong}"/>`;
  const defs = `<clipPath id="frame"><rect x="570" y="30" width="400" height="350" rx="16"/></clipPath>
<linearGradient id="fadeL" x1="0" x2="1"><stop offset="0" stop-color="${t.surface}" stop-opacity=".35"/><stop offset=".25" stop-color="${t.surface}" stop-opacity="0"/></linearGradient>`;
  const s = cardShell(t, W, H, inner, defs);
  return svgDoc({
    w: W, h: H, theme: t, fonts: ["sg700", "in400", "in600", "jb500"], css: cardCss(t), body: s.body, defs: s.defs,
    title: "VoiceCon: live voice conversion for phone calls",
    desc: "Android-first AI voice calling, live on voicecon.app. 86 ms median GPU inference per 180 ms block, about 0.5 s server-side delay, 0 ms audio dropped over a 5-minute run, 336 backend tests. Fails closed: a conversion error ends the call.",
  });
}

// ---------- Neuro-Screen ----------
function cardNeuro(t) {
  const W = 480, H = 450;
  const tg1 = tag(t, 32, 30, "RESEARCH");
  const tg2 = tag(t, 32 + tg1.w + 8, 30, "LIVE  streamlit", { color: t.good, dot: true });
  // chart rows: track x 32..448 is too wide; use 150..440
  const tx = 150, tw = 290;
  const row = (y, label, fillFrac, baseFrac, valTxt, noteTxt) => `
<text x="32" y="${y + 13}" font-family="${F.mono}" font-weight="500" font-size="12" fill="${t.muted}">${label}</text>
<rect x="${tx}" y="${y}" width="${tw}" height="18" rx="9" fill="${t.surface}" stroke="${t.line}"/>
<rect x="${tx}" y="${y}" width="${(tw * fillFrac).toFixed(1)}" height="18" rx="9" fill="url(#bar)"/>
<rect x="${(tx + tw * baseFrac - 1).toFixed(1)}" y="${y - 5}" width="2" height="28" rx="1" fill="${t.warn}"/>
<text x="${tx}" y="${y + 40}" font-family="${F.display}" font-weight="700" font-size="20" fill="${t.text}">${valTxt}</text>
<text x="${tx + 62}" y="${y + 39}" font-family="${F.sans}" font-weight="400" font-size="13" fill="${t.textSoft}">${noteTxt}</text>`;
  const inner = `
${tg1.svg}${tg2.svg}
<text x="32" y="100" font-family="${F.display}" font-weight="700" font-size="42" letter-spacing="-.9" fill="${t.text}">Neuro-Screen</text>
<text x="32" y="130" font-family="${F.sans}" font-weight="400" font-size="16" fill="${t.textSoft}">Found target leakage, removed it, and</text>
<text x="32" y="152" font-family="${F.sans}" font-weight="400" font-size="16" fill="${t.textSoft}">reported what the clean model really does.</text>
<rect x="20" y="176" width="440" height="168" rx="14" fill="${t.surface2}" stroke="${t.line}"/>
<text x="32" y="200" font-family="${F.mono}" font-weight="500" font-size="11.5" letter-spacing="1.2" fill="${t.accent}">LEAKAGE-FREE 5-FOLD NESTED CV</text>
${row(218, "accuracy", 0.621, 0.621, "62.1%", "= majority baseline")}
${row(282, "ROC-AUC", 0.48, 0.5, "0.48", "chance is 0.50")}
<text x="32" y="368" font-family="${F.mono}" font-weight="500" font-size="12" fill="${t.muted}">2,236 respondents  ·  12 predictors  ·  4-model stack</text>
${chipRow(t, 32, 386, [{ label: "Python", ic: "python" }, { label: "PyTorch", ic: "pytorch" }, { label: "Streamlit", ic: "streamlit" }])}
<text x="32" y="438" font-family="${F.mono}" font-weight="500" font-size="11" fill="${t.muted}">AIUB group project · app and re-analysis are my work</text>`;
  const defs = `<linearGradient id="bar" x1="0" x2="1"><stop offset="0" stop-color="${t.accentFill}"/><stop offset="1" stop-color="${t.violet}"/></linearGradient>`;
  const s = cardShell(t, W, H, inner, defs);
  return svgDoc({
    w: W, h: H, theme: t, fonts: ["sg700", "in400", "in600", "jb500"], css: cardCss(t), body: s.body, defs: s.defs,
    title: "Neuro-Screen: a negative result, reported straight",
    desc: "After removing target leakage, leakage-free 5-fold nested cross-validation gives 62.1 percent cognitive accuracy, equal to the majority baseline, and ROC-AUC 0.48 against a chance level of 0.50. 2,236 respondents, 12 predictors, a 4-model stack.",
  });
}

// ---------- Lumifi SMS (abstract card, private company work) ----------
function cardLumifi(t) {
  const W = 480, H = 450;
  const tg1 = tag(t, 32, 30, "COMPANY WORK");
  const tg2 = tag(t, 32 + tg1.w + 8, 30, "PRIVATE REPO", { color: t.muted });
  // three tenants, each with scoped rows; a query from one is blocked at the wall
  const cols = [["College A", 32], ["College B", 176], ["College C", 320]];
  let tenants = "";
  cols.forEach(([n, x], i) => {
    tenants += `<rect x="${x}" y="190" width="128" height="104" rx="10" fill="${t.surface}" stroke="${i === 1 ? t.accentFill : t.line}" stroke-width="${i === 1 ? 1.5 : 1}"/>
<text x="${x + 12}" y="212" font-family="${F.mono}" font-weight="500" font-size="11.5" fill="${i === 1 ? t.accent : t.muted}">${n}</text>`;
    for (let r = 0; r < 4; r++) tenants += `<rect x="${x + 12}" y="${224 + r * 16}" width="${[96, 70, 84, 56][r]}" height="8" rx="4" fill="${i === 1 ? t.accentFill : t.lineStrong}" opacity="${i === 1 ? 0.75 : 0.55}"/>`;
  });
  const inner = `
${tg1.svg}${tg2.svg}
<text x="32" y="100" font-family="${F.display}" font-weight="700" font-size="42" letter-spacing="-.9" fill="${t.text}">Lumifi SMS</text>
<text x="32" y="130" font-family="${F.sans}" font-weight="400" font-size="16" fill="${t.textSoft}">Multi-tenant student management for Australian</text>
<text x="32" y="152" font-family="${F.sans}" font-weight="400" font-size="16" fill="${t.textSoft}">training organisations. I built the Applications module.</text>
<rect x="20" y="170" width="440" height="140" rx="14" fill="${t.surface2}" stroke="${t.line}"/>
${tenants}
<text x="32" y="334" font-family="${F.mono}" font-weight="500" font-size="11.5" fill="${t.muted}">row-level scoping; no cross-tenant reads, tested</text>
<text x="32" y="368" font-family="${F.sans}" font-weight="400" font-size="14.5" fill="${t.text}">One shared form for public, staff and agent entry. Drafts,</text>
<text x="32" y="388" font-family="${F.sans}" font-weight="400" font-size="14.5" fill="${t.text}">Offer IDs, offer-letter versioning, CSV bulk import.</text>
${chipRow(t, 32, 404, [{ label: "Next.js", ic: "nextdotjs" }, { label: "TypeScript", ic: "typescript" }, { label: "PostgreSQL", ic: "postgresql" }, { label: "Drizzle" }])}`;
  const s = cardShell(t, W, H, inner);
  return svgDoc({
    w: W, h: H, theme: t, fonts: ["sg700", "in400", "in600", "jb500"], css: cardCss(t), body: s.body, defs: s.defs,
    title: "Lumifi SMS: multi-tenant student management",
    desc: "Company work at Lumifi Solutions. A multi-tenant student management system for Australian Registered Training Organisations on Next.js, TypeScript, Drizzle ORM and PostgreSQL, with per-college row-level scoping and tests that one college cannot see another's data. I built the Applications and Enrolments module.",
  });
}

// ---------- stack ----------
function stack(t) {
  const W = 1000;
  const groups = [
    ["LANGUAGES", [["Python", "python"], ["TypeScript", "typescript"], ["JavaScript", "javascript"], ["Kotlin", "kotlin"], ["C++", "cplusplus"]]],
    ["WEB AND MOBILE", [["React", "react"], ["Next.js", "nextdotjs"], ["Tailwind CSS", "tailwindcss"], ["Jetpack Compose", "jetpackcompose"], ["Android", "android"]]],
    ["BACKEND AND DATA", [["FastAPI", "fastapi"], ["Fastify", "fastify"], ["Node.js", "nodedotjs"], ["NestJS", "nestjs"], ["Express", "express"], ["PostgreSQL", "postgresql"], ["Prisma", "prisma"], ["Redis", "redis"], ["MongoDB", "mongodb"]]],
    ["AI AND ML", [["PyTorch", "pytorch"], ["scikit-learn", "scikitlearn"], ["Hugging Face", "huggingface"], ["OpenCV", "opencv"], ["pandas", "pandas"], ["Streamlit", "streamlit"]]],
    ["SHIPPING", [["Docker", "docker"], ["Git", "git"], ["Vercel", "vercel"], ["Twilio", "twilio"]]],
  ];
  let y = 28, body = "";
  const x0 = 220, maxX = W - 28;
  groups.forEach(([label, items], gi) => {
    let cx = x0, cy = y, rows = 1, chips = "";
    for (const [name, ic] of items) {
      const probe = chip(t, 0, 0, name, { ic, size: 14, h: 32 });
      if (cx + probe.w > maxX) { cx = x0; cy += 40; rows++; }
      chips += chip(t, cx, cy, name, { ic, size: 14, h: 32 }).svg;
      cx += probe.w + 8;
    }
    body += `<text x="28" y="${y + 21}" font-family="${F.mono}" font-weight="500" font-size="12" letter-spacing="1.2" fill="${t.muted}">${label}</text>${chips}`;
    y = cy + 32 + 18;
    if (gi < groups.length - 1) body += `<line x1="28" x2="${W - 28}" y1="${y - 9}" y2="${y - 9}" stroke="${t.line}"/>`;
  });
  const H = y + 10;
  const inner = `<rect width="${W}" height="${H}" rx="20" fill="${t.surface}"/><rect width="${W}" height="${H}" rx="20" fill="url(#ga)"/><rect width="${W}" height="${H}" rx="20" fill="url(#gb)"/>${body}<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="19.5" fill="none" stroke="${t.lineStrong}"/>`;
  return svgDoc({
    w: W, h: H, theme: t, fonts: ["in600", "jb500"], body: inner, defs: bgGlow(t),
    title: "Tech stack",
    desc: "Languages: Python, TypeScript, JavaScript, Kotlin, C++. Web and mobile: React, Next.js, Tailwind CSS, Jetpack Compose, Android. Backend and data: FastAPI, Fastify, Node.js, NestJS, Express, PostgreSQL, Prisma, Redis, MongoDB. AI and ML: PyTorch, scikit-learn, Hugging Face, OpenCV, pandas, Streamlit. Shipping: Docker, Git, Vercel, Twilio.",
  });
}

// ---------- footer ----------
function footer(t) {
  const W = 1000, H = 150;
  const pts = [];
  for (let i = 0; i <= 120; i++) {
    const x = 560 + i * 3.4;
    const env = Math.sin((i / 120) * Math.PI);
    const y = 75 + Math.sin(i * 0.55) * 26 * env * (0.6 + 0.4 * Math.sin(i * 0.17));
    pts.push(`${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  const body = `<rect width="${W}" height="${H}" rx="22" fill="${t.bg}"/><rect width="${W}" height="${H}" rx="22" fill="url(#ga)"/><rect width="${W}" height="${H}" rx="22" fill="url(#gb)"/><rect width="${W}" height="${H}" rx="22" fill="url(#dots)"/>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="21.5" fill="none" stroke="${t.lineStrong}"/>
<circle cx="52" cy="50" r="5" fill="${t.good}"/>
<text x="68" y="56" font-family="${F.display}" font-weight="700" font-size="28" fill="${t.text}">Open to work</text>
<text x="48" y="92" font-family="${F.sans}" font-weight="400" font-size="16" fill="${t.textSoft}">Full-stack, platform and applied ML roles, plus the occasional</text>
<text x="48" y="114" font-family="${F.sans}" font-weight="400" font-size="16" fill="${t.textSoft}">freelance or product project if it is interesting.</text>
<path d="${pts.join("")}" fill="none" stroke="url(#wave)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>`;
  const defs = `${bgGlow(t)}<linearGradient id="wave" x1="0" x2="1"><stop offset="0" stop-color="${t.accentFill}"/><stop offset=".6" stop-color="${t.violet}"/><stop offset="1" stop-color="${t.cyan}"/></linearGradient>
<pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="${t.dot}"/></pattern>`;
  return svgDoc({
    w: W, h: H, theme: t, fonts: ["sg700", "in400"], body, defs,
    title: "Open to work",
    desc: "Open to full-stack, platform and applied ML roles, plus select freelance and product work.",
  });
}

for (const t of Object.values(THEMES)) {
  save("header", t.name, header(t));
  save("card-voicecon", t.name, cardVoiceCon(t));
  save("card-neuro-screen", t.name, cardNeuro(t));
  save("card-lumifi-sms", t.name, cardLumifi(t));
  save("stack", t.name, stack(t));
  save("footer", t.name, footer(t));
}
