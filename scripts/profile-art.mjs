import { mkdirSync, writeFileSync } from "node:fs";

export function writeArt(name, theme, height, title, body) {
  const directory = new URL("../assets/", import.meta.url);
  mkdirSync(directory, { recursive: true });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="${height}" viewBox="0 0 960 ${height}">
<title>${title}</title>
<rect x=".5" y=".5" width="959" height="${height - 1}" rx="17" fill="${theme.paper}" stroke="${theme.line}"/>
${body}
</svg>
`;
  writeFileSync(new URL(`${name}.svg`, directory), svg);
}
