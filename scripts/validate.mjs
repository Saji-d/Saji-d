import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";

const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");
const assets = new URL("../assets/", import.meta.url);
const names = readdirSync(assets).sort();
const linked = [...new Set(readme.match(/assets\/[\w-]+\.svg/g) ?? [])]
  .map((name) => name.replace("assets/", "")).sort();

assert.deepEqual(names, linked, "The README and generated asset inventory must agree.");
assert.ok(names.length > 0, "No generated assets found.");

for (const name of names) {
  const path = new URL(name, assets);
  const art = readFileSync(path, "utf8");
  const budget = name.startsWith("workshop") ? 115_000 : 25_000;
  assert.ok(Buffer.byteLength(art) <= budget, `${name} exceeds ${budget} bytes`);
  assert.doesNotMatch(art, /<(?:script|foreignObject)\b|\bon[a-z]+\s*=|(?:url\(\s*|(?:href|src)=)["']?https?:/i, name);
  const xml = spawnSync("xmllint", ["--noout", decodeURIComponent(path.pathname)], { encoding: "utf8" });
  if (xml.error?.code !== "ENOENT") assert.equal(xml.status, 0, xml.stderr || name);
  console.log(`${name}: ${Buffer.byteLength(art)} bytes`);
}
