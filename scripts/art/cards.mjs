// The three featured project cards: VoiceCon, Neuro-Screen, Lumifi SMS.
import { THEMES, F, svgDoc, esc, icon, brand, r1, save, BASE_CSS, imageDataUri, pill, rng } from "./common.mjs";

const grid = (w, h, t) => `<pattern id="gr" width="26" height="26" patternUnits="userSpaceOnUse"><path d="M26 0H0V26" fill="none" stroke="${t.line}" stroke-width=".7" opacity=".55"/></pattern><rect width="${w}" height="${h}" fill="url(#gr)"/>`;
const bg = (w, h, t) => `<defs><clipPath id="cp"><rect width="${w}" height="${h}" rx="22"/></clipPath>
<radialGradient id="ga" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(0 0) rotate(35) scale(${w * 0.7} ${h * 0.9})"><stop offset="0" stop-color="${t.glowA}"/><stop offset="1" stop-color="${t.glowA}" stop-opacity="0"/></radialGradient>
<radialGradient id="gb" cx="${w}" cy="${h}" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(${w} ${h}) rotate(200) scale(${w * 0.6} ${h * 0.7})"><stop offset="0" stop-color="${t.glowB}"/><stop offset="1" stop-color="${t.glowB}" stop-opacity="0"/></radialGradient></defs>
<g clip-path="url(#cp)"><rect width="${w}" height="${h}" fill="${t.surface}"/>${grid(w, h, t)}<rect width="${w}" height="${h}" fill="url(#ga)"/><rect width="${w}" height="${h}" fill="url(#gb)"/>`;
const end = (w, h, t) => `</g><rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="21.5" fill="none" stroke="${t.lineStrong}"/>`;
const text = (x, y, s, { f = F.sans, w = 600, size = 14, fill, ls, anchor, cls } = {}) =>
  `<text x="${x}" y="${y}" font-family="${f}" font-weight="${w}" font-size="${size}"${ls ? ` letter-spacing="${ls}"` : ""}${anchor ? ` text-anchor="${anchor}"` : ""}${cls ? ` class="${cls}"` : ""} fill="${fill}">${esc(s)}</text>`;

// ---------- VoiceCon ----------
function voicecon(t) {
  const W = 1000, H = 456, dark = t.name === "dark";
  const shot = imageDataUri("src/img/voicecon.jpg");
  const eq = (x0, n, col, y) => Array.from({ length: n }, (_, i) => {
    const hh = [14, 26, 40, 22, 46, 30, 18, 38, 24, 34][i % 10];
    return `<rect class="eqb" x="${x0 + i * 8}" y="${y - hh / 2}" width="4.6" height="${hh}" rx="2.3" fill="${col}" style="animation-delay:-${r1((i * 0.29) % 1.2)}s;animation-duration:${r1(0.8 + (i % 4) * 0.2)}s"/>`;
  }).join("");
  const phone = (x, y, col, ring) => `<g transform="translate(${x} ${y})"><rect width="58" height="100" rx="13" fill="${t.surface2}" stroke="${col}" stroke-width="2"/><rect x="21" y="7" width="16" height="3.4" rx="1.7" fill="${t.lineStrong}"/><g fill="none" stroke="${col}" stroke-width="2.4" stroke-linecap="round"><rect x="24" y="30" width="10" height="20" rx="5"/><path d="M19 44q0 12 10 12t10 -12M29 56v8"/></g>${ring ? `<circle class="rg" cx="29" cy="40" r="13" fill="none" stroke="${col}" stroke-width="1.6"/>` : ""}</g>`;
  // chip
  const chip = (x, y) => {
    let cells = "", pins = "";
    for (let i = 0; i < 16; i++) cells += `<rect class="cell" x="${x + 14 + (i % 4) * 17}" y="${y + 14 + Math.floor(i / 4) * 17}" width="12" height="12" rx="2.5" fill="${t.accent}" style="animation-delay:-${r1((i * 0.37) % 2.4)}s"/>`;
    for (let i = 0; i < 5; i++) pins += `<path d="M${x + 14 + i * 17} ${y}v-9M${x + 14 + i * 17} ${y + 96}v9M${x}  ${y + 14 + i * 17}h-9M${x + 96} ${y + 14 + i * 17}h9" stroke="${t.lineStrong}" stroke-width="2.6" stroke-linecap="round"/>`;
    return `${pins}<rect x="${x}" y="${y}" width="96" height="96" rx="14" fill="${t.surface2}" stroke="${t.accent}" stroke-width="2"/>${cells}`;
  };
  const px = 36, py = 178;
  const pipeY = 226;
  const pipeline = `
<path d="M${px + 64} ${pipeY}H${px + 530}" stroke="${t.lineStrong}" stroke-width="2.4" stroke-dasharray="6 8" class="lane"/>
${phone(px, py, t.coral)}
${eq(px + 84, 8, t.coral, pipeY)}
${chip(px + 190, py + 0)}
${eq(px + 318, 8, t.accent, pipeY)}
<g transform="translate(${px + 410} ${py + 8})"><rect x="0" y="0" width="54" height="84" rx="12" fill="none" stroke="${t.good}" stroke-opacity=".5" stroke-dasharray="4 5"/><g class="lockg"><rect x="14" y="38" width="26" height="22" rx="5" fill="${t.good}"/><path d="M19 38v-7a8 8 0 0 1 16 0v7" fill="none" stroke="${t.good}" stroke-width="3.4"/><circle cx="27" cy="49" r="2.8" fill="${t.surface}"/></g></g>
${phone(px + 502, py, t.accent, true)}
<g class="pk" fill="${t.amber}"><rect x="${px + 66}" y="${pipeY - 4}" width="10" height="8" rx="3" style="animation-delay:0s"/><rect x="${px + 66}" y="${pipeY - 4}" width="10" height="8" rx="3" style="animation-delay:-1.2s"/><rect x="${px + 66}" y="${pipeY - 4}" width="10" height="8" rx="3" style="animation-delay:-2.4s"/></g>
${text(px + 29, py + 124, "caller", { f: F.mono, w: 500, size: 11, fill: t.muted, anchor: "middle" })}
${text(px + 238, py + 124, "GPU worker", { f: F.mono, w: 500, size: 11, fill: t.muted, anchor: "middle" })}
${text(px + 437, py + 124, "fails closed", { f: F.mono, w: 500, size: 11, fill: t.good, anchor: "middle" })}
${text(px + 531, py + 124, "recipient", { f: F.mono, w: 500, size: 11, fill: t.muted, anchor: "middle" })}`;

  // browser frame with the real site
  const bx = 672, by = 32, bw = 290, bh = 232;
  const browser = `<g class="fl"><rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="14" fill="${t.surface2}" stroke="${t.lineStrong}"/>
<circle cx="${bx + 16}" cy="${by + 14}" r="3.6" fill="${t.coral}"/><circle cx="${bx + 29}" cy="${by + 14}" r="3.6" fill="${t.amber}"/><circle cx="${bx + 42}" cy="${by + 14}" r="3.6" fill="${t.good}"/>
<rect x="${bx + 62}" y="${by + 6}" width="${bw - 78}" height="16" rx="8" fill="${t.surface}" stroke="${t.line}"/>${text(bx + 74, by + 18, "voicecon.app", { f: F.mono, w: 500, size: 10.5, fill: t.muted })}
<clipPath id="shot"><rect x="${bx + 1}" y="${by + 28}" width="${bw - 2}" height="${bh - 29}" rx="12"/></clipPath>
<image href="${shot}" x="${bx + 1}" y="${by + 28}" width="${bw - 2}" height="${r1((bw - 2) * 0.8)}" preserveAspectRatio="xMidYMin slice" clip-path="url(#shot)"/></g>`;

  // stats
  const stat = (x, val, label, viz) => `<g transform="translate(${x} 346)"><rect width="218" height="92" rx="16" fill="${t.surface2}" stroke="${t.line}"/>${text(18, 42, val, { f: F.display, w: 700, size: 34, fill: t.text, ls: -0.8 })}${text(18, 62, label, { f: F.mono, w: 500, size: 11, fill: t.muted })}${viz}</g>`;
  const bar = (v, col) => `<rect x="18" y="73" width="182" height="5" rx="2.5" fill="${t.line}"/><rect class="grow" x="18" y="73" width="${r1(182 * v)}" height="5" rx="2.5" fill="${col}"/>`;
  let tests = "";
  for (let i = 0; i < 28; i++) tests += `<rect class="tst" x="${18 + (i % 14) * 13}" y="${70 + Math.floor(i / 14) * 8}" width="10" height="5.4" rx="1.6" fill="${t.good}" style="animation-delay:-${r1((i * 0.43) % 3.2)}s"/>`;
  const stats = stat(36, "86 ms", "inference p50, 180 ms block", bar(86 / 180, t.accent))
    + stat(268, "~0.5 s", "server-side delay", bar(0.5, t.amber))
    + stat(500, "0 ms", "audio dropped, 5 min run", `<rect x="18" y="73" width="182" height="5" rx="2.5" fill="${t.line}"/><circle cx="20.5" cy="75.5" r="4.2" fill="${t.good}"/>`)
    + stat(732, "336", "backend tests", tests);

  const body = `${bg(W, H, t)}
${pill(36, 28, "LIVE", { color: t.good, dot: true, t }).svg}
${text(36, 112, "VoiceCon", { f: F.display, w: 700, size: 56, fill: t.text, ls: -1.8 })}
${text(36, 142, "Android-first AI voice calling", { size: 17, w: 500, fill: t.textSoft })}
${pipeline}${browser}${stats}${end(W, H, t)}`;
  const css = BASE_CSS + `
.cell{animation:pulse 2.4s ease-in-out infinite}
.pk rect{animation:pk 3.6s linear infinite}
@keyframes pk{0%{transform:translateX(0);opacity:0}8%{opacity:1}88%{opacity:1}100%{transform:translateX(436px);opacity:0}}
.lockg{transform-box:fill-box;transform-origin:center;animation:bob 3s ease-in-out infinite}
.tst{animation:blink 3.2s ease-in-out infinite}
.lane{animation:dash 1.4s linear infinite}`;
  return svgDoc({
    w: W, h: H, theme: t, fonts: ["sg700", "in600", "jb500"], body, css,
    title: "VoiceCon, live at voicecon.app",
    desc: "VoiceCon, live at voicecon.app. Android-first AI voice calling: speech is converted on a GPU and delivered over a normal phone call. Illustration of a caller's phone, a GPU chip, a fails-closed lock and the recipient's phone, beside a screenshot of the site. 86 ms median inference per 180 ms block, about 0.5 s server-side delay, 0 ms of audio dropped over a 5-minute run, 336 backend tests. It fails closed: any conversion error ends the call.",
  });
}

// ---------- Neuro-Screen ----------
function neuro(t) {
  const W = 500, H = 494;
  // brain: a cloud of lobes with gyri lines and a travelling pulse
  const lobes = [[110, 160, 44], [152, 134, 46], [200, 140, 42], [236, 168, 38], [198, 192, 40], [140, 196, 44], [100, 192, 30], [168, 166, 44]];
  const brain = `<g class="fl" transform="translate(6 20)"><g fill="${t.surface2}" stroke="${t.lineStrong}" stroke-width="1.6">${lobes.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join("")}</g>
<g fill="${t.surface2}">${lobes.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r - 1}"/>`).join("")}</g>
<path d="M96 188q16 -26 36 -4t36 -18t38 6M120 150q18 14 34 -6t34 4M138 126q10 16 30 8M170 206q22 -10 44 6M214 160q10 14 -4 28" fill="none" stroke="${t.accent}" stroke-opacity=".55" stroke-width="2.4" stroke-linecap="round"/>

${[[120, 168], [152, 142], [190, 160], [224, 176], [176, 196], [136, 200]].map(([x, y], i) => `<circle class="nd" cx="${x}" cy="${y}" r="4.2" fill="${i % 2 ? t.amber : t.accentFill}" style="animation-delay:-${r1(i * 0.45)}s"/>`).join("")}
<path d="M120 168L152 142L190 160L224 176L176 196L136 200L120 168M152 142L176 196M190 160L136 200" fill="none" stroke="${t.accent}" stroke-width="1.2" stroke-opacity=".6" stroke-dasharray="4 5" class="lane"/></g>`;
  // stacked ensemble
  const mods = ["rf", "gb", "lr", "svm"];
  const ens = mods.map((m, i) => {
    const y = 126 + i * 38;
    return `<rect x="300" y="${y}" width="52" height="26" rx="8" fill="${t.surface2}" stroke="${t.lineStrong}"/>${text(326, y + 17, m, { f: F.mono, w: 500, size: 11, fill: t.textSoft, anchor: "middle" })}<path d="M352 ${y + 13}C380 ${y + 13} 386 186 414 186" fill="none" stroke="${t.accent}" stroke-opacity=".55" stroke-width="1.6" stroke-dasharray="4 5" class="lane"/>`;
  }).join("");
  const meta = `<rect x="414" y="164" width="54" height="44" rx="12" fill="${t.accentFill}" fill-opacity=".16" stroke="${t.accent}" stroke-width="1.8"/>${text(441, 191, "meta", { f: F.mono, w: 500, size: 12, fill: t.accent, anchor: "middle" })}`;
  // nested CV folds
  const folds = Array.from({ length: 5 }, (_, i) => `<g><rect x="${28 + i * 89}" y="312" width="80" height="30" rx="8" fill="${t.surface2}" stroke="${t.line}"/><rect class="fold" x="${28 + i * 89}" y="312" width="80" height="30" rx="8" fill="${t.amber}" opacity="${i ? 0 : 0.85}" style="animation-delay:-${r1(7 - i * 1.4)}s"/>${text(68 + i * 89, 332, "fold " + (i + 1), { f: F.mono, w: 500, size: 10.5, fill: t.textSoft, anchor: "middle" })}</g>`).join("");
  const stat = (x, v, l) => `<g transform="translate(${x} 392)"><rect width="140" height="78" rx="16" fill="${t.surface2}" stroke="${t.line}"/>${text(16, 38, v, { f: F.display, w: 700, size: 30, fill: t.text, ls: -0.6 })}${text(16, 60, l, { f: F.mono, w: 500, size: 10.5, fill: t.muted })}</g>`;
  const body = `${bg(W, H, t)}
${pill(28, 22, "RESEARCH", { color: t.amber, t }).svg}${pill(150, 22, "PAPER FORTHCOMING", { color: t.accent, t }).svg}
${text(28, 84, "Neuro-Screen", { f: F.display, w: 700, size: 36, fill: t.text, ls: -1 })}
${brain}${ens}${meta}
${text(28, 296, "5-FOLD NESTED CROSS-VALIDATION", { f: F.mono, w: 500, size: 10.5, fill: t.muted, ls: 1.2 })}
${text(300, 116, "STACKED ENSEMBLE", { f: F.mono, w: 500, size: 10.5, fill: t.muted, ls: 1.2 })}
${folds}
${stat(28, "2,236", "survey responses")}${stat(180, "12", "predictors")}${stat(332, "4", "base models")}
${end(W, H, t)}`;
  const css = BASE_CSS + `
.nd{animation:pulse 2.2s ease-in-out infinite}
.fold{animation:fold 7s ease-in-out infinite}
@keyframes fold{0%{opacity:0}4%,18%{opacity:.85}24%,100%{opacity:0}}
.lane{animation:dash 1.6s linear infinite}`;
  return svgDoc({
    w: W, h: H, theme: t, fonts: ["sg700", "jb500"], body, css,
    title: "Neuro-Screen",
    desc: "Neuro-Screen, a leakage-controlled stacked-ensemble study with nested cross-validation on 2,236 survey responses and 12 predictors, built from four base models. The paper is forthcoming. Illustration of a brain network, four base models feeding a meta learner, and five cross-validation folds taking turns as the held-out fold.",
  });
}

// ---------- Lumifi SMS ----------
function lumifi(t) {
  const W = 500, H = 494, dark = t.name === "dark";
  const tenants = [[t.accent, "A"], [t.amber, "B"], [t.sky, "C"]];
  const tiles = tenants.map(([c, l], i) => {
    const x = 28 + i * 150;
    const rows = [0, 1, 2].map((r) => `<rect class="row" x="${x + 14}" y="${178 + r * 14}" width="${[78, 60, 70][(r + i) % 3]}" height="6" rx="3" fill="${c}" opacity=".5" style="animation-delay:-${r1(r * 0.5 + i * 0.3)}s"/>`).join("");
    return `<g><rect x="${x}" y="112" width="130" height="104" rx="16" fill="${t.surface2}" stroke="${c}" stroke-opacity=".7" stroke-width="1.6"/>
<g transform="translate(${x + 14} 124)"><rect x="0" y="6" width="28" height="30" rx="3" fill="${c}" opacity=".9"/><path d="M-3 7L14 -4L31 7z" fill="${c}"/><path d="M6 14h4v4H6zM18 14h4v4h-4zM6 24h4v4H6zM18 24h4v6h-4z" fill="${t.surface2}"/></g>
<g transform="translate(${x + 100} 130)"><rect x="-8" y="6" width="16" height="12" rx="3" fill="${c}"/><path d="M-4 6V3a4 4 0 0 1 8 0v3" fill="none" stroke="${c}" stroke-width="2"/></g>
${rows}<rect class="ring" x="${x}" y="112" width="130" height="104" rx="16" fill="none" stroke="${c}" stroke-width="2" style="animation-delay:-${i * 1.3}s"/></g>`;
  }).join("");
  const nodes = [["Application", "doc"], ["Offer", "mail"], ["Enrolment", "check"]];
  const gl = (k, c) => ({
    doc: `<path d="M-8 -10h11l6 6v14h-17z" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round"/><path d="M-4 0h9M-4 5h9" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/>`,
    mail: `<rect x="-10" y="-7" width="20" height="14" rx="3" fill="none" stroke="${c}" stroke-width="2"/><path d="M-9 -5l9 7l9 -7" fill="none" stroke="${c}" stroke-width="2"/>`,
    check: `<circle r="10" fill="none" stroke="${c}" stroke-width="2"/><path d="M-5 0l4 4l7 -8" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`,
  })[k];
  const flow = nodes.map(([n, k], i) => {
    const x = 62 + i * 188 - (i === 2 ? 20 : 0), c = [t.accent, t.amber, t.good][i];
    return `<g transform="translate(${x} 316)"><circle r="26" fill="${t.surface2}" stroke="${c}" stroke-width="2"/>${gl(k, c)}${text(0, 50, n, { f: F.mono, w: 500, size: 11, fill: t.textSoft, anchor: "middle" })}</g>`;
  }).join("");
  const flowLine = `<path d="M88 316H230M278 316H402" stroke="${t.lineStrong}" stroke-width="2.4" stroke-dasharray="6 8" class="lane"/><circle class="tok" cx="88" cy="316" r="5" fill="${t.amber}"/>`;
  const chips = [["nextdotjs", "Next.js"], ["typescript", "TypeScript"], ["postgresql", "PostgreSQL"]].map(([k, l], i) => {
    const x = 28 + i * 120;
    return `<g transform="translate(${x} 410)"><rect width="${i === 1 ? 112 : 104}" height="34" rx="17" fill="${t.chip}" stroke="${t.chipLine}"/>${icon(k, 11, 8.5, 17, brand(k, t))}${text(34, 22, l, { size: 12.5, w: 600, fill: t.text })}</g>`;
  }).join("");
  const body = `${bg(W, H, t)}
${pill(28, 22, "COMPANY WORK", { color: t.amber, t }).svg}${pill(168, 22, "PRIVATE REPO", { color: t.muted, t }).svg}
${text(28, 84, "Lumifi SMS", { f: F.display, w: 700, size: 36, fill: t.text, ls: -1 })}
${text(28, 110, "Multi-tenant student management for Australian RTOs", { size: 12.5, w: 500, fill: t.textSoft })}
<g transform="translate(0 18)">${tiles}</g>${text(28, 266, "ONE COLLEGE NEVER SEES ANOTHER", { f: F.mono, w: 500, size: 10.5, fill: t.muted, ls: 1.2 })}
<g transform="translate(0 26)">${flowLine}${flow}${chips}</g>
${end(W, H, t)}`;
  const css = BASE_CSS + `
.row{animation:pulse 2.6s ease-in-out infinite}
.ring{transform-box:fill-box;transform-origin:center;animation:rpl 4s ease-out infinite}
@keyframes rpl{0%{transform:scale(1);opacity:.7}60%,100%{transform:scale(1.07);opacity:0}}
.tok{animation:tok 4.2s ease-in-out infinite}
@keyframes tok{0%{transform:translateX(0);opacity:0}8%{opacity:1}92%{opacity:1}100%{transform:translateX(314px);opacity:0}}
.lane{animation:dash 1.4s linear infinite}`;
  return svgDoc({
    w: W, h: H, theme: t, fonts: ["sg700", "in600", "jb500"], body, css,
    title: "Lumifi SMS, company work",
    desc: "Lumifi SMS, company work in a private repository. A multi-tenant student management system for Australian training organisations on Next.js, TypeScript and PostgreSQL, with per-college row-level scoping so one college never sees another's records. Illustration of three separate college tenants and an application, offer and enrolment flow. I built the Applications and Enrolments module.",
  });
}

for (const t of Object.values(THEMES)) { save("card-voicecon", t, voicecon(t)); save("card-neuro-screen", t, neuro(t)); save("card-lumifi-sms", t, lumifi(t)); }
