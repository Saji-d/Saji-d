import { readFileSync } from "node:fs";
import { writeArt } from "./profile-art.mjs";

const art = { paper: "#13151b", line: "#3d3649", ink: "#f2e8db", lavender: "#c6afe4", apricot: "#ffb98e" };
const font = 'font-family="system-ui,sans-serif"';
const file = (name, type) => `data:image/${type};base64,${readFileSync(new URL(`../src/workshop/${name}`, import.meta.url)).toString("base64")}`;

const hero = cat => `
<clipPath id="frame"><rect x="1" y="1" width="958" height="290" rx="16"/></clipPath>
<g clip-path="url(#frame)">
  <image x="472" y="0" width="510" height="292" href="${file("room.webp", "webp")}"/>
  <image x="725" y="117" width="130" height="130" href="${cat}"/>
</g>
<g ${font} fill="${art.ink}">
  <text x="38" y="88" font-size="57" font-weight="800" letter-spacing="-2">Sajidur</text>
  <text x="38" y="150" font-size="57" font-weight="800" letter-spacing="-2">Rahman Sajid</text>
  <text x="40" y="198" font-size="30" fill="${art.lavender}">Full-stack engineer · Dhaka</text>
  <text x="40" y="244" font-size="25" fill="${art.apricot}">The cat reviews my life choices.</text>
</g>`;

writeArt("workshop", art, 292, "Sajidur Rahman Sajid’s workshop", hero(file("mascot.gif", "gif")));
writeArt("workshop-still", art, 292, "Sajidur Rahman Sajid’s workshop", hero(file("mascot-still.png", "png")));

const records = [
  ["Lumifi Solutions", "Remote · Present"],
  ["RemoteIntegrity", "Remote · Present"],
  ["LedgerCross", "Dhaka · 2026"],
  ["BSS", "Dhaka · 2026"],
];
const stops = records.map(([name, role], index) => {
  const x = 125 + 237 * index;
  return `<circle cx="${x}" cy="39" r="7" fill="${art.apricot}"/><text x="${x}" y="79" font-weight="650">${name}</text><text x="${x}" y="109" fill="${art.lavender}">${role}</text>`;
}).join("");
writeArt("experience", art, 134, "Experience timeline, newest role first", `
<path d="M125 39H836" stroke="${art.lavender}" stroke-width="2"/>
<g ${font} text-anchor="middle" font-size="24" fill="${art.ink}">${stops}</g>`);

const projects = [
  ["lumifi", "Lumifi SMS", ["Two portals.", "Five roles.", "The admin PR stays", "in drafts."]],
  ["voicecon", "VoiceCon", ["Live voice conversion.", "If it fails, hang up."]],
  ["aria", "Aria ERP", ["Sales, stock and", "finance in one place."]],
  ["fumak", "FUMAK", ["Phone scans.", "Checkout updates", "stock in one transaction."]],
  ["invoicepilot", "InvoicePilot", ["OCR, validation", "and fraud checks."]],
  ["casevault", "CaseVault", ["Search Bangladeshi", "statutes and judgments."]],
];
for (const [slug, name, lines] of projects) {
  const caption = lines.map((line, i) => `<text x="36" y="${155 + 43 * i}">${line}</text>`).join("");
  writeArt(`tile-${slug}`, art, 336, name, `
<clipPath id="crop"><rect x="463" y="16" width="482" height="304" rx="7"/></clipPath>
<g clip-path="url(#crop)"><image x="463" y="16" width="482" height="304" href="${file(`${slug}.webp`, "webp")}"/></g>
<text x="34" y="91" ${font} font-size="62" fill="${art.ink}" font-weight="800" letter-spacing="-1.7">${name}</text>
<g ${font} font-size="37" fill="${art.lavender}">${caption}</g>`);
}
