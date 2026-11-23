// An original ginger cat, drawn in SVG. Two poses:
//   runningCat(t)  - galloping right, headset on, backpack with a laptop, tongue out
//   sittingCat(t)  - typing at a laptop, tail swishing
// All motion is CSS (so prefers-reduced-motion can stop it). The static pose is
// always a complete, visible cat. Origin is the ground under the cat.
// Rotations pivot on each group's local origin, which is why joints are nested
// <g transform="translate(...)"> wrappers around <g class="..."> children.

export const CAT_CSS = `
.cb{animation:cb .27s ease-in-out infinite}
.cbp{animation:cb .27s ease-in-out -.07s infinite;--a:-2.5px}
.ch{animation:ch .55s ease-in-out infinite}
.cup{animation:cup .55s cubic-bezier(.45,0,.55,1) infinite}
.clo{animation:clo .55s cubic-bezier(.45,0,.55,1) infinite}
.d1{animation-delay:0s}.d2{animation-delay:-.07s}.d3{animation-delay:-.27s}.d4{animation-delay:-.34s}
.ct1{animation:ct1 .55s ease-in-out infinite}
.ct2{animation:ct2 .55s ease-in-out -.12s infinite}
.cear{animation:cear .27s ease-in-out infinite}
.cshadow{transform-box:fill-box;transform-origin:center;animation:csh .27s ease-in-out infinite}
.cdust{transform-box:fill-box;transform-origin:center;animation:cdust .55s ease-out infinite}
.cspd{animation:cspd .27s linear infinite}
.csweat{animation:csweat 1.1s ease-in infinite}
.cw{animation:cw .55s ease-in-out infinite}
@keyframes cb{0%,100%{transform:translateY(0)}25%{transform:translateY(var(--a,-4px))}50%{transform:translateY(0)}75%{transform:translateY(var(--a,-4px))}}
@keyframes ch{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(3deg)}}
@keyframes cup{0%{transform:rotate(-44deg)}50%{transform:rotate(40deg)}100%{transform:rotate(-44deg)}}
@keyframes clo{0%{transform:rotate(6deg)}50%{transform:rotate(14deg)}75%{transform:rotate(78deg)}100%{transform:rotate(6deg)}}
@keyframes ct1{0%,100%{transform:rotate(-7deg)}50%{transform:rotate(9deg)}}
@keyframes ct2{0%,100%{transform:rotate(-24deg)}50%{transform:rotate(26deg)}}
@keyframes cear{0%,100%{transform:rotate(0)}50%{transform:rotate(-9deg)}}
@keyframes csh{0%,50%,100%{transform:scaleX(1);opacity:.28}25%,75%{transform:scaleX(.82);opacity:.16}}
@keyframes cdust{0%{transform:translate(0,0) scale(.5);opacity:.55}100%{transform:translate(-34px,-5px) scale(1.7);opacity:0}}
@keyframes cspd{0%{transform:translateX(0);opacity:.55}100%{transform:translateX(-14px);opacity:.1}}
@keyframes csweat{0%{transform:translate(0,0);opacity:.95}100%{transform:translate(-22px,-14px);opacity:0}}
@keyframes cw{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(5deg)}}
`;

const leg = (x, far, cls, t) => {
  const fill = far ? t.furDark : t.fur;
  const paw = far ? t.furDark : t.belly;
  return `<g transform="translate(${x} -28)"><g class="cup ${cls}"><path d="M0 0L1 13" stroke="${fill}" stroke-width="7.4" stroke-linecap="round"/><g transform="translate(1 13)"><g class="clo ${cls}"><path d="M0 0L0 11" stroke="${fill}" stroke-width="6" stroke-linecap="round"/><ellipse cx="2.4" cy="12.4" rx="5.4" ry="3.1" fill="${paw}"/></g></g></g></g>`;
};

export function runningCat(t) {
  const f = t.fur, fd = t.furDark, bl = t.belly, ink = t.ink;
  return `<g class="cat-run">
<ellipse class="cshadow" cx="2" cy="1.5" rx="38" ry="4" fill="#000" opacity=".28"/>
<g class="cspd" stroke="${t.muted}" stroke-width="2" stroke-linecap="round" opacity=".5"><path d="M-62 -44h-18M-66 -34h-26M-60 -24h-14"/></g>
<g fill="${t.muted}"><circle class="cdust" cx="-36" cy="-3" r="4" style="animation-delay:0s"/><circle class="cdust" cx="-36" cy="-3" r="3.4" style="animation-delay:-.18s"/><circle class="cdust" cx="-36" cy="-3" r="3" style="animation-delay:-.36s"/></g>
<g class="cb">
${leg(-22, true, "d4", t)}${leg(22, true, "d2", t)}
<g transform="translate(-30 -45)"><g class="ct1"><path d="M0 0Q-13 -3 -23 -9" fill="none" stroke="${f}" stroke-width="7.6" stroke-linecap="round"/><g transform="translate(-23 -9)"><g class="ct2"><path d="M0 0Q-9 -3 -16 -12" fill="none" stroke="${f}" stroke-width="6.6" stroke-linecap="round"/><path d="M-12.5 -8.5L-16.4 -12.4" stroke="${fd}" stroke-width="6.8" stroke-linecap="round"/><path d="M-4 -2.4l-1.4 4M-8.6 -5.2l-1.4 4" stroke="${fd}" stroke-width="2"/></g></g></g></g>
<path d="M-33 -36C-34 -50 -18 -55 2 -54C22 -53 36 -49 35 -38C34 -27 18 -24 0 -24C-18 -24 -32 -26 -33 -36Z" fill="${f}"/>
<path d="M-26 -27C-14 -22 14 -22 28 -27C22 -22 6 -20 -6 -20C-16 -20 -24 -22 -26 -27Z" fill="${bl}" opacity=".9"/>
<g stroke="${fd}" stroke-width="2.6" stroke-linecap="round" fill="none" opacity=".85"><path d="M-14 -52q2 7 0 13"/><path d="M-4 -53q2 8 0 15"/><path d="M6 -53q2 8 0 14"/></g>
<g class="cbp"><g transform="translate(-11 -58)"><path d="M-8 -9L-5 -15" stroke="${ink}" stroke-width="0"/><rect x="-10" y="-20" width="17" height="10" rx="1.5" fill="#cfd8dc" transform="rotate(-8 -1 -15)"/><rect x="-7" y="-18" width="4" height="4" rx="1" fill="${t.amber}" transform="rotate(-8 -1 -15)"/><rect x="-16" y="-14" width="30" height="25" rx="7" fill="#14b8a6"/><rect x="-16" y="-14" width="30" height="10" rx="5" fill="#0d9488"/><rect x="-9" y="1" width="16" height="7" rx="2.5" fill="#0f766e"/><circle cx="-1" cy="4.5" r="1.4" fill="${t.amber}"/></g></g>
<path d="M-4 -52C6 -40 14 -34 18 -26" fill="none" stroke="#0d9488" stroke-width="3.4" stroke-linecap="round" opacity=".95"/>
${leg(-26, false, "d3", t)}${leg(26, false, "d1", t)}
</g>
<g class="cb"><g transform="translate(35 -52)"><g class="ch">
<g transform="translate(-3 -11)"><g class="cear"><path d="M-9 4L-7 -15L5 -3Z" fill="${fd}"/></g></g>
<ellipse cx="0" cy="0" rx="17.5" ry="15" fill="${f}"/>
<g transform="translate(7 -11)"><g class="cear"><path d="M-6 4L4 -15L12 3Z" fill="${f}"/><path d="M-1 1L4 -9L8 1Z" fill="#ff8fa3"/></g></g>
<path d="M-1 -14q1 5 0 8M-7 -13q1 4 0 7M5 -14q1 4 0 7" stroke="${fd}" stroke-width="2.2" stroke-linecap="round" fill="none"/>
<ellipse cx="11.5" cy="4.6" rx="9" ry="7" fill="${bl}"/>
<path d="M-1 -3q3 -4 7 -2" stroke="${ink}" stroke-width="2.3" stroke-linecap="round" fill="none" transform="rotate(14 3 -4)"/>
<path d="M9 -5q3 -4 8 -1" stroke="${ink}" stroke-width="2.3" stroke-linecap="round" fill="none" transform="rotate(16 13 -6)"/>
<circle cx="4" cy="0" r="4.4" fill="#fff"/><circle cx="14.4" cy="0.8" r="4.6" fill="#fff"/>
<circle cx="5.6" cy="0.6" r="2.3" fill="${ink}"/><circle cx="16" cy="1.3" r="2.4" fill="${ink}"/><circle cx="6.3" cy="-.2" r=".8" fill="#fff"/><circle cx="16.7" cy=".5" r=".8" fill="#fff"/>
<path d="M19.6 4.6l3.8 .2l-1.6 2.6z" fill="#ff7b94"/>
<path d="M12 9.5Q18 12 23 8.5" stroke="${ink}" stroke-width="1.7" fill="none" stroke-linecap="round"/>
<path d="M16 10.4q1 6 5.5 5.6q2 -3 .6 -6.4z" fill="#ff7b94" stroke="#e0526e" stroke-width=".8"/>
<g class="cw" stroke="${t.textSoft}" stroke-width="1" stroke-linecap="round" opacity=".7"><path d="M10 6L-6 1M10 8L-8 8M11 9L-4 15"/></g>
<path d="M-8 -9C-4 -22 12 -20 14 -8" fill="none" stroke="#1f2937" stroke-width="3.2" stroke-linecap="round"/>
<circle cx="-8.5" cy="1" r="5.2" fill="#0f766e" stroke="#1f2937" stroke-width="1.6"/>
<path d="M-9 6Q-4 17 11 14" fill="none" stroke="#1f2937" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="13.8" r="2.7" fill="${t.coral}"/>
<g class="csweat"><path d="M10 -17q-3 5 0 7q3 -2 0 -7z" fill="${t.sky}"/></g>
</g></g></g>
</g>`;
}

// ---- sitting cat at a laptop (footer) ----
export const SIT_CSS = `
.s-tail{animation:s-tail 3.2s ease-in-out infinite}
.s-tail2{animation:s-tail2 3.2s ease-in-out -.4s infinite}
.s-pawa{animation:s-paw .36s ease-in-out infinite}
.s-pawb{animation:s-paw .36s ease-in-out -.18s infinite}
.s-blink{transform-box:fill-box;transform-origin:center;animation:s-blink 4.6s ease-in-out infinite}
.s-ear{animation:s-ear 5s ease-in-out infinite}
.s-head{animation:s-head 4s ease-in-out infinite}
.s-z{animation:s-z 3s ease-out infinite}
@keyframes s-tail{0%,100%{transform:rotate(-12deg)}50%{transform:rotate(14deg)}}
@keyframes s-tail2{0%,100%{transform:rotate(-22deg)}50%{transform:rotate(24deg)}}
@keyframes s-paw{0%,100%{transform:translateY(0)}50%{transform:translateY(-3.2px)}}
@keyframes s-blink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.1)}}
@keyframes s-ear{0%,86%,100%{transform:rotate(0)}90%{transform:rotate(-14deg)}94%{transform:rotate(3deg)}}
@keyframes s-head{0%,100%{transform:rotate(0)}50%{transform:rotate(2.5deg)}}
@keyframes s-z{0%{transform:translate(0,0);opacity:.9}100%{transform:translate(8px,-26px);opacity:0}}
`;

export function sittingCat(t) {
  const f = t.fur, fd = t.furDark, bl = t.belly, ink = t.ink;
  return `<g class="cat-sit">
<ellipse cx="0" cy="2" rx="62" ry="5" fill="#000" opacity=".25"/>
<g transform="translate(-34 -8)"><g class="s-tail"><path d="M0 0Q-26 4 -32 -22" fill="none" stroke="${f}" stroke-width="12" stroke-linecap="round"/><g transform="translate(-32 -22)"><g class="s-tail2"><path d="M0 0Q-2 -14 8 -22" fill="none" stroke="${f}" stroke-width="10" stroke-linecap="round"/><path d="M4.5 -17.5L8 -22" stroke="${fd}" stroke-width="10.4" stroke-linecap="round"/></g></g></g></g>
<path d="M-36 0C-40 -30 -30 -62 -6 -64C18 -66 28 -40 24 0Z" fill="${f}"/>
<path d="M-4 -2C-8 -26 0 -50 12 -52C22 -34 18 -12 14 -2Z" fill="${bl}"/>
<g stroke="${fd}" stroke-width="3" stroke-linecap="round" fill="none"><path d="M-30 -30q6 2 10 0M-31 -20q6 2 10 0M-31 -10q6 2 10 0"/></g>
<g transform="translate(6 -76)"><g class="s-head">
<g transform="translate(-3 -11)"><g class="s-ear"><path d="M-9 4L-8 -15L5 -3Z" fill="${fd}"/></g></g>
<ellipse cx="0" cy="0" rx="19" ry="16" fill="${f}"/>
<path d="M8 -10L14 -26L22 -6Z" fill="${f}"/><path d="M11 -10L14 -19L18 -9Z" fill="#ff8fa3"/>
<path d="M-2 -15q1 5 0 8M4 -15q1 4 0 7" stroke="${fd}" stroke-width="2.2" stroke-linecap="round" fill="none"/>
<ellipse cx="11" cy="5" rx="10" ry="7.6" fill="${bl}"/>
<g class="s-blink"><circle cx="4" cy="0" r="4.4" fill="#fff"/><circle cx="15" cy="0.5" r="4.6" fill="#fff"/><circle cx="6" cy="1.6" r="2.4" fill="${ink}"/><circle cx="16.6" cy="2" r="2.5" fill="${ink}"/><circle cx="6.8" cy="1" r=".8" fill="#fff"/><circle cx="17.4" cy="1.4" r=".8" fill="#fff"/></g>
<path d="M18.6 5.2l4 .2l-1.7 2.6z" fill="#ff7b94"/>
<path d="M13 9.6Q18 12 22.5 9" stroke="${ink}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
<g stroke="${t.textSoft}" stroke-width="1" stroke-linecap="round" opacity=".7"><path d="M9 6L-8 2M9 8L-9 9"/></g>
<path d="M-10 -9C-5 -25 14 -22 16 -8" fill="none" stroke="#1f2937" stroke-width="3.2" stroke-linecap="round"/>
<circle cx="-9" cy="2" r="5.4" fill="#0f766e" stroke="#1f2937" stroke-width="1.6"/>
<path d="M-10 7Q-4 18 12 15" fill="none" stroke="#1f2937" stroke-width="2" stroke-linecap="round"/><circle cx="13" cy="14.8" r="2.7" fill="${t.coral}"/>
</g></g>
<g transform="translate(34 -4)"><path d="M0 0l30 0l6 -40" fill="none"/>
<path d="M-6 0L58 0L52 -3L-2 -3Z" fill="#9aa7b0"/><path d="M4 -3L12 -46Q13 -48 15 -48L62 -48Q64 -48 63.4 -46L54 -3Z" fill="#cfd8dc"/><path d="M10 -6L16 -42L58 -42L50 -6Z" fill="${t.ink}"/>
<g font-family="monospace" font-size="6.4" fill="${t.accentFill}"><text x="18" y="-34">&gt; ship</text><text x="18" y="-26" fill="${t.amber}">  ok</text><text x="18" y="-18" fill="${t.coral}">_</text></g>
<circle cx="34" cy="-22" r="4" fill="${t.amber}" opacity=".9"/></g>
<g transform="translate(26 -22)"><g class="s-pawa"><ellipse cx="0" cy="0" rx="6" ry="4" fill="${bl}"/></g></g>
<g transform="translate(40 -20)"><g class="s-pawb"><ellipse cx="0" cy="0" rx="6" ry="4" fill="${bl}"/></g></g>
<g font-family="monospace" font-weight="700" fill="${t.accentFill}" font-size="11"><text class="s-z" x="30" y="-98" style="animation-delay:0s">&lt;/&gt;</text><text class="s-z" x="30" y="-98" style="animation-delay:-1.5s" fill="${t.amber}">{ }</text></g>
</g>`;
}
