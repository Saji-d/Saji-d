import { readFileSync } from "node:fs";
import { writeArt } from "./profile-art.mjs";

const query = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        weeks { contributionDays { date contributionCount } }
      }
    }
  }
}`;

async function fetchCalendar() {
  const token = process.env.GITHUB_TOKEN;
  const login = process.env.GITHUB_REPOSITORY_OWNER || "Saji-d";
  if (!token) throw new Error("GITHUB_TOKEN is required when no calendar file is provided.");
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { login } }),
    signal: AbortSignal.timeout(20_000),
  });
  const result = await response.json();
  if (!response.ok || result.errors) throw new Error(`GitHub calendar query failed (HTTP ${response.status}).`);
  return result.data.user.contributionsCollection.contributionCalendar;
}

const input = process.argv[2];
const calendar = input ? JSON.parse(readFileSync(input, "utf8")) : await fetchCalendar();
const weeks = calendar.weeks;
if (!Array.isArray(weeks) || weeks.length < 50 || weeks.length > 54) {
  throw new Error("Expected up to one year of weekly contribution calendar data.");
}
const totals = weeks.map(({ contributionDays }) => {
  if (!Array.isArray(contributionDays) || !contributionDays.length || contributionDays.some(
    ({ date, contributionCount }) => !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isSafeInteger(contributionCount) || contributionCount < 0,
  )) throw new Error("Invalid contribution calendar day.");
  return contributionDays.reduce((sum, { contributionCount }) => sum + contributionCount, 0);
});

const first = weeks[0].contributionDays[0].date;
const last = weeks.at(-1).contributionDays.at(-1).date;
const month = new Intl.DateTimeFormat("en", { month: "short", year: "numeric", timeZone: "UTC" });
const max = Math.max(1, ...totals);
const pitch = 864 / totals.length;
const baseline = 169;
const colors = ["#74628f", "#a88cca", "#c6afe4", "#ffb98e"];

const windows = totals.map((count, week) => {
  const floors = count ? Math.max(1, Math.round(count / max * 12)) : 0;
  return Array.from({ length: floors }, (_, floor) => {
    const x = (48 + week * pitch).toFixed(2);
    const y = baseline - 11 * (floor + 1);
    const color = colors[(week * 7 + floor * 3) % colors.length];
    return `<rect x="${x}" y="${y}" width="${(pitch * .69).toFixed(2)}" height="8" fill="${color}"/>`;
  }).join("");
}).join("");

writeArt("activity", { paper: "#13151b", line: "#3d3649" }, 218, "Weekly contribution skyline", `
<path d="M858 32a14 14 0 1 0 15 21 16 16 0 0 1-15-21Z" fill="#ffb98e"/>
<path d="M48 172H912" stroke="#3d3649"/>
${windows}
<g font-family="system-ui,sans-serif" font-size="27" fill="#c6afe4">
  <text x="48" y="202">${month.format(new Date(first))}</text>
  <text x="912" y="202" text-anchor="end">${month.format(new Date(last))}</text>
</g>`);
