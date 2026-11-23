#!/usr/bin/env node
// Checks every SVG in assets/: well-formed XML (xmllint, skipped if missing),
// under 100 KB, no scripts, no external URLs (GitHub's proxy would block them).
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { ROOT } from "./lib/kit.mjs";

const dir = join(ROOT, "assets");
const hasXmllint = spawnSync("xmllint", ["--version"]).status !== null;
if (!hasXmllint) console.warn("xmllint not found, skipping XML check");
let bad = 0;
for (const f of readdirSync(dir).filter((f) => f.endsWith(".svg"))) {
  const p = join(dir, f);
  const text = readFileSync(p, "utf8");
  const problems = [];
  const kb = statSync(p).size / 1024;
  if (kb > 100) problems.push(`${kb.toFixed(0)} KB is over 100 KB`);
  if (/<script|onload=|onclick=/i.test(text)) problems.push("contains script");
  if (/(?:href|src)=["']https?:/i.test(text) || /url\(\s*["']?https?:/i.test(text)) problems.push("external reference");
  if (hasXmllint) {
    const r = spawnSync("xmllint", ["--noout", p], { encoding: "utf8" });
    if (r.status !== 0) problems.push("xmllint: " + r.stderr.trim().split("\n")[0]);
  }
  console.log(`${problems.length ? "FAIL" : "ok  "} ${f} (${kb.toFixed(1)} KB)${problems.length ? " - " + problems.join("; ") : ""}`);
  bad += problems.length;
}
process.exit(bad ? 1 : 0);
