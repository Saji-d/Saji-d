// Footer: the cat on a rooftop with a laptop, same city as the header.
import { THEMES, F, svgDoc, esc, rng, r1, save, BASE_CSS } from "./common.mjs";
import { skyline } from "./city.mjs";
import { sittingCat, SIT_CSS } from "../lib/cat.mjs";

const W = 1000, H = 330, BASE = 300;
function footer(t) {
  const dark = t.name === "dark";
  const rand = rng(77);
  const city = skyline(t, { base: BASE, heightAt: (x) => (x < 560 ? 60 + 30 * Math.sin(x / 90) : 54), seed: 33 });
  let sky = "";
  if (dark) {
    for (let i = 0; i < 50; i++) sky += `<circle class="st s${i % 4}" cx="${r1(rand() * W)}" cy="${r1(rand() * 170)}" r="${r1(0.5 + rand() * 1.2)}" fill="#fff" opacity=".7"/>`;
    sky += `<circle cx="640" cy="60" r="60" fill="url(#halo)"/><circle cx="640" cy="60" r="20" fill="#f6efe3"/><circle cx="649" cy="55" r="18" fill="#0a2230"/>`;
  } else {
    sky += `<circle cx="640" cy="60" r="80" fill="url(#halo)"/><circle cx="640" cy="60" r="26" fill="#ffb02e"/><circle cx="640" cy="60" r="18" fill="#ffd36b"/>`;
  }
  // rooftop with a water tank and an antenna dish
  const rx = 640, ry = BASE - 56;
  const roof = `<g><rect x="${rx}" y="${ry}" width="330" height="${H - ry}" fill="${t.near}"/><rect x="${rx - 6}" y="${ry - 6}" width="342" height="8" rx="3" fill="${dark ? "#0d2736" : "#4d8386"}"/>
<g transform="translate(${rx + 262} ${ry - 6})"><path d="M-14 0V-34h28V0z" fill="${dark ? "#0d2736" : "#4d8386"}"/><path d="M-18 -34h36l-4 -9h-28z" fill="${t.mid}"/><path d="M-10 0L-14 10M10 0L14 10" stroke="${t.near}" stroke-width="3"/></g>
<g transform="translate(${rx + 300} ${ry - 6})"><path d="M0 0V-44" stroke="${dark ? "#0d2736" : "#4d8386"}" stroke-width="3"/><circle cx="0" cy="-46" r="3.4" fill="${t.coral}" class="pu"/>${[0, 0.9].map((d) => `<circle class="rg" cx="0" cy="-46" r="9" fill="none" stroke="${t.accent}" stroke-width="1.5" style="animation-delay:-${d}s"/>`).join("")}</g>
<path d="M${rx + 20} ${ry + 14}h4.4v6.2h-4.4zM${rx + 38} ${ry + 14}h4.4v6.2h-4.4z" fill="${t.win}" opacity=".9"/></g>`;
  const defs = `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${t.skyTop}"/><stop offset=".6" stop-color="${t.skyMid}"/><stop offset="1" stop-color="${t.skyLow}"/></linearGradient>
<radialGradient id="halo"><stop offset="0" stop-color="${dark ? "#cfe9ff" : "#ffcf66"}" stop-opacity="${dark ? 0.26 : 0.5}"/><stop offset="1" stop-color="${dark ? "#cfe9ff" : "#ffcf66"}" stop-opacity="0"/></radialGradient>
<linearGradient id="nm" x1="0" x2="1"><stop offset="0" stop-color="${dark ? "#fff7e6" : t.ink}"/><stop offset="1" stop-color="${dark ? t.accent : "#0f766e"}"/></linearGradient>
<clipPath id="cp"><rect width="${W}" height="${H}" rx="22"/></clipPath>`;
  const body = `<g clip-path="url(#cp)"><rect width="${W}" height="${H}" fill="url(#sky)"/>${sky}${city.svg}<rect y="${BASE}" width="${W}" height="${H - BASE}" fill="${t.near}"/>${roof}
<g transform="translate(790 ${ry - 6}) scale(1.15)">${sittingCat(t)}</g></g>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="21.5" fill="none" stroke="${t.line}"/>
<text x="48" y="108" font-family="${F.display}" font-weight="700" font-size="50" letter-spacing="-1.4" fill="url(#nm)">Let's build something.</text>
<text x="50" y="146" font-family="${F.sans}" font-weight="600" font-size="17" fill="${dark ? t.textSoft : t.ink}">Full-stack, platform and applied ML roles. Freelance too.</text>`;
  const css = BASE_CSS + SIT_CSS + city.css + `@keyframes tw{0%,100%{opacity:.25}50%{opacity:1}}.st{animation:tw 3s ease-in-out infinite}.s1{animation-delay:-.7s;animation-duration:4s}.s2{animation-delay:-1.4s;animation-duration:2.4s}.s3{animation-delay:-2.2s;animation-duration:5s}`;
  return svgDoc({
    w: W, h: H, theme: t, fonts: ["sg700", "in600"], defs, body, css,
    title: "Let's build something",
    desc: "Let's build something. Open to full-stack, platform and applied ML roles, and select freelance work. A ginger cat wearing a headset sits on a rooftop typing at a laptop above the city skyline.",
  });
}
for (const t of Object.values(THEMES)) save("footer", t, footer(t));
