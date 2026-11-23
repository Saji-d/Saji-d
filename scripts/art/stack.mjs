// Two marquee rows of real logos, scrolling in opposite directions.
// One set is exactly 1000 px wide, so the static (reduced-motion) view shows every logo.
import { THEMES, F, svgDoc, icon, brand, r1, save, BASE_CSS } from "./common.mjs";

const W = 1000, H = 176, SLOTS = 15, PITCH = W / SLOTS, TILE = 56;
const ROW1 = ["python", "typescript", "javascript", "kotlin", "cplusplus", "react", "nextdotjs", "tailwindcss", "jetpackcompose", "android", "fastapi", "fastify", "nodedotjs", "nestjs", "express"];
const ROW2 = ["postgresql", "prisma", "redis", "mongodb", "pytorch", "scikitlearn", "huggingface", "opencv", "pandas", "streamlit", "docker", "git", "vercel", "twilio", "cat"];

// the 15th tile of row two is the mascot's face
const catFace = (t, x, y) => `<g transform="translate(${x} ${y})"><path d="M6 24L8 6L18 13Q28 10 38 13L48 6L50 24Q56 40 28 46Q0 40 6 24Z" fill="${t.fur}"/><path d="M10 20L11 11L16 15ZM46 20L45 11L40 15Z" fill="#ff8fa3"/><circle cx="20" cy="26" r="4" fill="#fff"/><circle cx="36" cy="26" r="4" fill="#fff"/><circle cx="21" cy="27" r="2.2" fill="${t.ink}"/><circle cx="37" cy="27" r="2.2" fill="${t.ink}"/><path d="M26 33h4l-2 3z" fill="#ff7b94"/><path d="M28 36q-3 4-6 2M28 36q3 4 6 2" stroke="${t.ink}" fill="none" stroke-width="1.5" stroke-linecap="round"/><path d="M14 20q4-4 8-2M34 18q4-2 8 2" stroke="${t.ink}" stroke-width="2" fill="none" stroke-linecap="round"/></g>`;

function row(t, keys, y, rowIdx) {
  const tile = (k, i, off) => {
    const x = off + i * PITCH + (PITCH - TILE) / 2;
    const c = k === "cat" ? t.fur : brand(k, t);
    const inner = k === "cat" ? catFace(t, r1(x), y + 3) : icon(k, x + 14, y + 14, 28, c);
    return `<g><rect x="${r1(x)}" y="${y}" width="${TILE}" height="${TILE}" rx="16" fill="${t.surface2}" stroke="${t.line}"/>${inner}</g>`;
  };
  const one = (off) => keys.map((k, i) => tile(k, i, off)).join("");
  return `<g class="${rowIdx ? "mr" : "mf"}">${one(0)}${one(W)}</g>`;
}

function stack(t) {
  const body = `<defs><clipPath id="cp"><rect width="${W}" height="${H}" rx="22"/></clipPath></defs><g clip-path="url(#cp)"><rect width="${W}" height="${H}" fill="${t.surface}"/>
<path d="M0 ${H / 2}H${W}" stroke="${t.line}" stroke-dasharray="2 8" opacity=".6"/>
${row(t, ROW1, 22, 0)}${row(t, ROW2, 98, 1)}</g><rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="21.5" fill="none" stroke="${t.line}"/>`;
  return svgDoc({
    w: W, h: H, theme: t, fonts: [], body, css: BASE_CSS + `.mf{animation:marq 46s linear infinite}.mr{animation:marqr 52s linear infinite}`,
    title: "Tech stack",
    desc: "Two scrolling rows of logos. Languages: Python, TypeScript, JavaScript, Kotlin, C++. Web and mobile: React, Next.js, Tailwind CSS, Jetpack Compose, Android. Backend: FastAPI, Fastify, Node.js, NestJS, Express, PostgreSQL, Prisma, Redis, MongoDB. AI and ML: PyTorch, scikit-learn, Hugging Face, OpenCV, pandas, Streamlit. Shipping: Docker, Git, Vercel, Twilio.",
  });
}
for (const t of Object.values(THEMES)) save("stack", t, stack(t));
