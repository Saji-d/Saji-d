// "Now" strip: two live cards, with small animated pictures of the work.
import { THEMES, F, svgDoc, esc, icon, brand, r1, save, BASE_CSS } from "./common.mjs";

const W = 1000, H = 216;
const text = (x, y, s, { f = F.sans, w = 600, size = 14, fill, ls } = {}) =>
  `<text x="${x}" y="${y}" font-family="${f}" font-weight="${w}" font-size="${size}"${ls ? ` letter-spacing="${ls}"` : ""} fill="${fill}">${esc(s)}</text>`;

function now(t) {
  const card = (x) => `<rect x="${x}" y="54" width="468" height="150" rx="20" fill="${t.surface}" stroke="${t.lineStrong}"/>`;
  // Lumifi: Southern Cross constellation + growing tenant bars
  const stars = [[44, 20, 5.2], [18, 52, 4.4], [70, 56, 4.4], [44, 92, 5.2], [58, 66, 2.6]].map(([x, y, r], i) =>
    `<g transform="translate(${x} ${y})"><path class="tw" d="M0 ${-r * 1.9}L${r * .5} ${-r * .5}L${r * 1.9} 0L${r * .5} ${r * .5}L0 ${r * 1.9}L${-r * .5} ${r * .5}L${-r * 1.9} 0L${-r * .5} ${-r * .5}Z" fill="${t.amber}" style="animation-delay:-${r1(i * 0.7)}s"/></g>`).join("");
  const lumifi = `${card(28)}<g transform="translate(48 70)">${stars}</g>
<path d="M92 90L112 118M92 122L112 118M92 122L76 118" stroke="${t.line}" opacity="0"/>
${text(140, 98, "Lumifi Solutions", { f: F.display, w: 700, size: 22, fill: t.text, ls: -0.4 })}
${text(140, 122, "Full-Stack Developer", { size: 14.5, w: 600, fill: t.textSoft })}
${text(140, 144, "AUSTRALIA, REMOTE  |  SINCE NOV 2026", { f: F.mono, w: 500, size: 10.5, fill: t.muted, ls: 0.8 })}
<g transform="translate(140 160)">${[["nextdotjs", 0], ["typescript", 30], ["postgresql", 60], ["prisma", 90]].map(([k, dx]) => `${icon(k, dx, 0, 20, brand(k, t))}`).join("")}</g>
<g transform="translate(400 150)">${[0, 1, 2, 3, 4].map((i) => `<rect class="eqb" x="${i * 11}" y="${-[30, 44, 24, 52, 36][i]}" width="7" height="${[30, 44, 24, 52, 36][i]}" rx="3" fill="${[t.accent, t.amber, t.sky, t.accent, t.amber][i]}" style="animation-delay:-${r1(i * 0.31)}s;animation-duration:${r1(1.6 + i * 0.2)}s"/>`).join("")}</g>`;
  // RemoteIntegrity: ERP and partner ERP, linked
  const rx = 504;
  const riq = `${card(rx)}
<g transform="translate(${rx + 20} 84)"><rect width="62" height="46" rx="12" fill="${t.surface2}" stroke="${t.accent}" stroke-width="1.8"/>${text(31, 29, "ERP", { f: F.mono, w: 500, size: 12.5, fill: t.accent }).replace("<text ", '<text text-anchor="middle" ')}
<path d="M64 23H92" stroke="${t.lineStrong}" stroke-width="2" stroke-dasharray="4 5" class="lane"/><circle class="hop" cx="64" cy="23" r="3.4" fill="${t.amber}"/>
<rect x="94" y="-6" width="82" height="58" rx="12" fill="none" stroke="${t.amber}" stroke-width="1.8" stroke-dasharray="5 5" class="lane"/>${text(135, 20, "partner", { f: F.mono, w: 500, size: 10, fill: t.amber }).replace("<text ", '<text text-anchor="middle" ')}${text(135, 36, "ERP", { f: F.mono, w: 500, size: 12.5, fill: t.amber }).replace("<text ", '<text text-anchor="middle" ')}
<rect x="104" y="42" width="62" height="3.4" rx="1.7" fill="${t.line}"/><rect class="bld" x="104" y="42" width="62" height="3.4" rx="1.7" fill="${t.amber}"/></g>
${text(rx + 222, 98, "RemoteIntegrity", { f: F.display, w: 700, size: 22, fill: t.text, ls: -0.4 })}
${text(rx + 222, 122, "Full-Stack Developer", { size: 14.5, w: 600, fill: t.textSoft })}
${text(rx + 222, 144, "ERP + PARTNER ERP BUILD", { f: F.mono, w: 500, size: 10.5, fill: t.muted, ls: 0.8 })}
<g transform="translate(${rx + 222} 160)"><rect width="70" height="22" rx="11" fill="${t.chip}" stroke="${t.chipLine}"/><circle cx="13" cy="11" r="3.4" fill="${t.good}" class="pu"/>${text(22, 15, "ACTIVE", { f: F.mono, w: 500, size: 10, fill: t.good, ls: 0.8 })}</g>`;
  const head = `<g><circle cx="38" cy="30" r="5" fill="${t.coral}"/><circle class="rg" cx="38" cy="30" r="5" fill="none" stroke="${t.coral}" stroke-width="1.6"/>${text(52, 35, "NOW", { f: F.display, w: 700, size: 17, fill: t.text, ls: 1.5 })}</g>`;
  const body = `<defs><clipPath id="cp"><rect width="${W}" height="${H}" rx="22"/></clipPath></defs>${head}${lumifi}${riq}`;
  const css = BASE_CSS + `
.tw{transform-box:fill-box;transform-origin:center;animation:tws 2.4s ease-in-out infinite}
@keyframes tws{0%,100%{transform:scale(1) rotate(0);opacity:.7}50%{transform:scale(1.25) rotate(20deg);opacity:1}}
.hop{animation:hop 1.8s ease-in-out infinite}
@keyframes hop{0%{transform:translateX(0);opacity:0}15%,85%{opacity:1}100%{transform:translateX(28px);opacity:0}}
.bld{transform-box:fill-box;transform-origin:0 50%;animation:bl 5s ease-in-out infinite;transform:scaleX(.62)}
@keyframes bl{0%{transform:scaleX(.2)}80%,100%{transform:scaleX(.7)}}
.lane{animation:dash 1.6s linear infinite}`;
  return svgDoc({
    w: W, h: H, theme: t, fonts: ["sg700", "in600", "jb500"], body, css,
    title: "Now",
    desc: "Currently working at two places. Lumifi Solutions, Australia, remote, since November 2026, as Full-Stack Developer on Next.js, TypeScript, PostgreSQL and Prisma. RemoteIntegrity, Full-Stack Developer, working on their existing ERP system and building an external partner ERP system.",
  });
}
for (const t of Object.values(THEMES)) save("now", t, now(t));
