// Renders every card in assets/ and README.md. No dependencies.
// node scripts/build.mjs            (needs GITHUB_TOKEN)
// node scripts/build.mjs data.json  (use a saved GraphQL response)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const root = new URL('..', import.meta.url);
const b64 = (p, type) => `data:${type};base64,${readFileSync(new URL(p, root)).toString('base64')}`;
const LOGIN = process.env.GITHUB_REPOSITORY_OWNER || 'Saji-d';

/* ---------------------------------------------------------------- data */
const LANGS = 'languages(first:30){edges{size node{name color}}}';
const query = `query($login:String!){user(login:$login){
  createdAt
  contributionsCollection{totalCommitContributions totalPullRequestContributions totalIssueContributions restrictedContributionsCount
    contributionCalendar{totalContributions weeks{contributionDays{date contributionCount}}}}
  repositories(first:100,privacy:PUBLIC,ownerAffiliations:OWNER,isFork:false,orderBy:{field:PUSHED_AT,direction:DESC}){totalCount
    nodes{name isPrivate pushedAt ${LANGS} primaryLanguage{name color} defaultBranchRef{target{... on Commit{messageHeadline}}}}}}}`;

async function graphql(token, q) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: q, variables: { login: LOGIN } }),
    signal: AbortSignal.timeout(30_000),
  });
  const json = await res.json();
  if (!res.ok || json.errors) throw new Error(`GitHub query failed (HTTP ${res.status}): ${JSON.stringify(json.errors)}`);
  return json.data.user;
}

// LANGUAGES_TOKEN can see private repos. Only languages are asked for, never names, so nothing private can reach a card.
async function privateLanguages() {
  if (!process.env.LANGUAGES_TOKEN) return null;
  try {
    const { repositories: r } = await graphql(process.env.LANGUAGES_TOKEN, `query($login:String!){user(login:$login){
      repositories(first:100,ownerAffiliations:OWNER,isFork:false){pageInfo{hasNextPage} nodes{isPrivate ${LANGS}}}}}`);
    if (!r.nodes.some((n) => n.isPrivate)) throw new Error('the token sees no private repositories');
    if (r.pageInfo.hasNextPage) console.log('::warning::Only the first 100 repositories are counted in the languages card');
    return r.nodes;
  } catch (e) {
    // an expired token must not freeze every other card
    console.log(`::warning::Languages card is public-only: ${e.message}`);
    return null;
  }
}

// ACTIVITY_TOKEN (classic, `repo` scope) can see every repository the account can. The card shows
// only repositories with a commit by the account owner, and only that commit's first words.
// Workflow logs are public: never log names, messages or API error text from here.
async function recentWork() {
  const token = process.env.ACTIVITY_TOKEN;
  if (!token) return null;
  const ask = async (query, variables) => {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(30_000),
    });
    return (await res.json()).data; // an organisation that blocks the token nulls only its own rows
  };
  try {
    const { viewer } = await ask('{viewer{id login}}');
    if (viewer.login !== LOGIN) throw new Error('wrong account');
    const data = await ask(`query($id:ID!){viewer{repositories(first:40,affiliations:[OWNER,COLLABORATOR,ORGANIZATION_MEMBER],ownerAffiliations:[OWNER,COLLABORATOR,ORGANIZATION_MEMBER],orderBy:{field:PUSHED_AT,direction:DESC}){
      nodes{name owner{login} isPrivate primaryLanguage{name} defaultBranchRef{target{... on Commit{history(first:1,author:{id:$id}){nodes{messageHeadline committedDate}}}}}}}}}`, { id: viewer.id });
    const rows = data.viewer.repositories.nodes.flatMap((r) => {
      const c = r?.defaultBranchRef?.target?.history?.nodes[0];
      return c ? [{ owner: r.owner.login, name: r.name, isPrivate: r.isPrivate, language: r.primaryLanguage?.name, date: c.committedDate, message: c.messageHeadline }] : [];
    });
    if (!rows.some((r) => r.isPrivate)) throw new Error('no private rows');
    return rows.sort((a, z) => Date.parse(z.date) - Date.parse(a.date));
  } catch {
    console.log('::warning::Recently pushed card is public-only: ACTIVITY_TOKEN could not read private repositories');
    return null;
  }
}

async function load() {
  if (process.argv[2]) return JSON.parse(readFileSync(process.argv[2], 'utf8')).data.user;
  if (!process.env.GITHUB_TOKEN) throw new Error('GITHUB_TOKEN is required');
  return graphql(process.env.GITHUB_TOKEN, query);
}

const user = await load();
const withPrivate = await privateLanguages();
const work = await recentWork();
const cc = user.contributionsCollection;
const weeks = cc.contributionCalendar.weeks;
if (!weeks?.length) throw new Error('Empty contribution calendar');
const days = weeks.flatMap((w) => w.contributionDays);
const total = cc.contributionCalendar.totalContributions;
const best = days.reduce((a, d) => (d.contributionCount > a.contributionCount ? d : a));
const thisWeek = weeks.at(-1).contributionDays.reduce((s, d) => s + d.contributionCount, 0);
let longest = 0, run = 0;
for (const d of days) { run = d.contributionCount ? run + 1 : 0; longest = Math.max(longest, run); }
let current = 0;
// today may simply not have happened yet, so a zero on the last day does not break the streak
for (let i = days.length - (days.at(-1).contributionCount ? 1 : 2); i >= 0 && days[i].contributionCount; i--) current++;
const repos = user.repositories.nodes.filter((r) => !r.isPrivate);
const langTitle = withPrivate ? 'Languages by code size, all repos' : 'Languages by code size, public repos';
// the profile repo itself is not a project; round down to a multiple of five so "+" stays true
const projectCount = `${Math.floor((user.repositories.totalCount - 1) / 5) * 5}+`;
const yearsOnGitHub = `${Math.floor((Date.now() - new Date(user.createdAt)) / (365.25 * 864e5))}+`;
const statsAlt = `3.91 CGPA at AIUB, 5 Dean’s Awards, ${projectCount} public repositories, ${yearsOnGitHub} years on GitHub`;

/* ---------------------------------------------------------------- drawing */
const C = { bg: '#0a0a0b', line: '#26262a', soft: '#1a1a1e', ink: '#ffffff', mute: '#a8a49c', acc: '#8b7cf6', green: '#3fb950' };
const RAMP = ['#17171b', '#2e2856', '#483d8f', '#6a5acb', '#9d8df9'];
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const num = (n) => n.toLocaleString('en-US');
const mon = (d) => new Date(d + 'T00:00:00Z').toLocaleString('en', { month: 'short', timeZone: 'UTC' });
const cut = (s, n) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

const FONTS = `@font-face{font-family:I;font-weight:100 900;src:url(${b64('src/inter-normal-400.woff2', 'font/woff2')})}
@font-face{font-family:J;font-weight:100 900;src:url(${b64('src/jb-normal-400.woff2', 'font/woff2')})}`;
const CAT = b64('src/cat.gif', 'image/gif');
const STILL = b64('src/cat-still.png', 'image/png');

const t = (x, y, s, { size = 14, fill = C.ink, w = 400, mono = false, anchor, space, extra = '' } = {}) =>
  `<text x="${x}" y="${y}" font-family="${mono ? 'J,ui-monospace,monospace' : 'I,system-ui,sans-serif'}" font-size="${size}" font-weight="${w}" fill="${fill}"${anchor ? ` text-anchor="${anchor}"` : ''}${space ? ` letter-spacing="${space}"` : ''} ${extra}>${esc(s)}</text>`;
const label = (x, y, s, o = {}) => t(x, y, s.toUpperCase(), { size: 11, fill: C.mute, mono: true, space: 1.4, ...o });
const rule = (x1, x2, y, c = C.line) => `<path d="M${x1} ${y}H${x2}" stroke="${c}"/>`;
const sq = (x, y, c = C.acc, s = 5) => `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="${c}"/>`;
const cat = (x, y, s) => `<image class="gif" x="${x}" y="${y}" width="${s}" height="${s}" href="${CAT}"/><image class="still" x="${x}" y="${y}" width="${s}" height="${s}" href="${STILL}"/>`;

function wrap(s, width, size, mono = false) {
  const max = Math.floor(width / (size * (mono ? 0.6 : 0.52)));
  const lines = [''];
  for (const word of s.split(' ')) {
    const next = lines.at(-1) ? `${lines.at(-1)} ${word}` : word;
    if (next.length > max && lines.at(-1)) lines.push(word); else lines[lines.length - 1] = next;
  }
  return lines;
}
const para = (x, y, s, width, o = {}, lh = 20) => {
  const lines = wrap(s, width, o.size ?? 14, o.mono);
  return { svg: lines.map((l, i) => t(x, y + i * lh, l, o)).join(''), h: lines.length * lh };
};

function svg(w, h, title, body, { card = true, css = '' } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title>
<style>${FONTS}.still{display:none}${css}@media (prefers-reduced-motion:reduce){*{animation:none!important}.gif{display:none}.still{display:inline}}</style>
${card ? `<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="12" fill="${C.bg}" stroke="${C.line}"/>` : ''}${body}</svg>`;
}

/* ---------------------------------------------------------------- cards */
const header = (m) => {
  const W = m ? 420 : 846, H = m ? 486 : 300, x = m ? 26 : 44;
  let b = label(x, 46, 'Dhaka, Bangladesh');
  b += t(x, m ? 88 : 96, 'Sajidur Rahman', { size: m ? 38 : 44, w: 700, space: -1.2 });
  let y = m ? 128 : 96;
  if (m) b += t(x, y, 'Sajid', { size: 38, w: 700, space: -1.2 });
  else b = label(x, 46, 'Dhaka, Bangladesh') + t(x, 96, 'Sajidur Rahman Sajid', { size: 40, w: 700, space: -1.2 });
  y += 30;
  b += t(x, y, 'Full-stack software engineer · AI/ML.', { size: 17, fill: C.mute });
  y += 24; b += rule(x, m ? W - 26 : 450, y);
  y += 28;
  const rows = [
    ['Full-Stack Developer', 'Lumifi Solutions'],
    ['Full-Stack Developer, contract', 'RemoteIntegrity'],
    ['B.Sc. CSE, CGPA 3.91', 'AIUB, Dhaka'],
    ['5× Dean’s Award', 'AIUB'],
  ];
  rows.forEach(([a, c], i) => {
    b += sq(x, y + i * 25 - 7, i ? '#8d8a83' : C.acc);
    b += `<text x="${x + 15}" y="${y + i * 25}" font-family="I,system-ui,sans-serif" font-size="${m ? 13.5 : 14.5}" fill="${C.ink}">${esc(a)}<tspan fill="${C.mute}"> · ${esc(c)}</tspan></text>`;
  });
  // dot field with the dancing cat
  const ox = m ? 44 : 486, oy = m ? 322 : 62, cols = m ? 18 : 18, rowsN = m ? 8 : 11, step = m ? 19.5 : 19;
  const cx = ox + ((cols - 1) * step) / 2, cy = oy + ((rowsN - 1) * step) / 2, R = m ? 58 : 62;
  for (let i = 0; i < cols; i++) for (let j = 0; j < rowsN; j++) {
    const px = ox + i * step, py = oy + j * step;
    if (Math.hypot(px - cx, py - cy) < R + 12) continue;
    const hot = (i * 7 + j * 3) % 23 === 0;
    b += hot ? `<rect class="tw" style="animation-delay:-${(i * 0.37 + j * 0.61).toFixed(2)}s" x="${px - 2}" y="${py - 2}" width="4" height="4" fill="${C.acc}"/>` : `<circle cx="${px}" cy="${py}" r="1.3" fill="#4a4a52"/>`;
  }
  b += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="${C.bg}" stroke="#2c2945" stroke-width="1.5"/>`;
  b += `<ellipse class="shadow" cx="${cx}" cy="${cy + 42}" rx="30" ry="6" fill="#4b3f8f" opacity=".7"/>`;
  b += `<g class="float">${cat(cx - 52, cy - 58, 104)}</g>`;
  b += label(m ? W - 26 : W - 44, H - 20, 'sajidur.me', { anchor: 'end', extra: 'style="text-transform:none"' }).replace('SAJIDUR.ME', 'sajidur.me');
  return svg(W, H, 'Sajidur Rahman Sajid, full-stack software engineer, AI/ML, Dhaka. Full-Stack Developer at Lumifi Solutions and RemoteIntegrity.', b, {
    css: `.float{animation:fl 3.2s ease-in-out infinite}@keyframes fl{50%{transform:translateY(-6px)}}
.shadow{transform-box:fill-box;transform-origin:center;animation:sh 3.2s ease-in-out infinite}@keyframes sh{50%{transform:scaleX(.78)}}
.tw{animation:tw 4s ease-in-out infinite}@keyframes tw{50%{opacity:.25}}`,
  });
};

const badge = (text, solid) => {
  const w = Math.round(text.length * 8.9 + 34);
  return svg(w, 28, text, `<rect width="${w}" height="28" rx="2" fill="${solid ? C.acc : '#000'}"/>`
    + t(w / 2 + 0.8, 18.5, text.toUpperCase(), { size: 11, w: 600, mono: true, space: 1.6, anchor: 'middle' }), { card: false });
};

const available = (m) => {
  const W = m ? 420 : 846, H = m ? 132 : 92, x = m ? 26 : 44;
  let b = `<circle class="pulse" cx="${x + 5}" cy="30" r="4" fill="${C.green}"/>` + t(x + 20, 35, 'Open to better opportunities', { size: 15, w: 600 });
  let px = x;
  for (const [s, w] of [['Full stack', 100], ['AI/ML engineering', 148], ['Freelance', 98]]) {
    b += `<rect x="${px}" y="50" width="${w}" height="26" rx="13" fill="none" stroke="#5a4fa8"/>` + t(px + w / 2, 67.5, s, { size: 12, anchor: 'middle' });
    px += w + (m ? 11 : 9);
  }
  if (m) b += rule(x, W - 26, 94) + t(x, 116, 'sajidsajidurrahman99@gmail.com', { size: 12, fill: C.acc, mono: true });
  else b += t(W - 44, 35, 'sajidsajidurrahman99@gmail.com', { size: 12.5, fill: C.acc, mono: true, anchor: 'end' }) + label(W - 44, 68, 'Email me', { anchor: 'end' });
  return svg(W, H, 'Open to better opportunities: full stack, AI/ML engineering, freelance.', b, { css: `.pulse{animation:p 2s ease-in-out infinite}@keyframes p{50%{opacity:.35}}` });
};

const stats = (m) => {
  const W = m ? 420 : 846, H = m ? 208 : 122;
  const items = [['3.91', 'CGPA at AIUB'], ['5×', 'Dean’s Awards'], [projectCount, 'Public repositories'], [yearsOnGitHub, 'Years on GitHub']];
  let b = '';
  items.forEach(([v, l], i) => {
    const x = m ? 26 + (i % 2) * 200 : 44 + i * 196, y = m ? 54 + Math.floor(i / 2) * 94 : 56;
    b += t(x, y, v, { size: 32, w: 700, space: -0.8 }) + t(x, y + 24, l, { size: 12.5, fill: C.mute }) + `<rect x="${x}" y="${y + 40}" width="22" height="1.5" fill="${C.acc}"/>`;
    if (!m && i) b += `<path d="M${x - 24} 28V94" stroke="${C.line}"/>`;
  });
  return svg(W, H, `${statsAlt}.`, b);
};

const now = (m) => {
  const W = m ? 420 : 846, x = m ? 26 : 44;
  const all = work ?? repos.map((r) => ({ owner: LOGIN, name: r.name, isPrivate: false, language: r.primaryLanguage?.name, date: r.pushedAt, message: r.defaultBranchRef?.target?.messageHeadline ?? '' }));
  const list = all.filter((r) => !(r.owner === LOGIN && r.name === LOGIN) && !/wedding|reception/i.test(r.name)).slice(0, 6);
  const rowH = m ? 62 : 45, H = 66 + list.length * rowH + 8;
  const updated = new Date(days.at(-1).date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  let b = sq(x, 33) + label(x + 13, 40, 'Recently pushed') + label(W - x, 40, `Updated ${updated}`, { anchor: 'end' });
  list.forEach((r, i) => {
    const y = 80 + i * rowH;
    const tag = r.isPrivate ? `<tspan dx="10" font-family="J,ui-monospace,monospace" font-size="9.5" font-weight="400" fill="${C.acc}">PRIVATE</tspan>` : '';
    b += `<text x="${x}" y="${y}" font-family="I,system-ui,sans-serif" font-size="${m ? 13.5 : 15}" fill="${C.mute}">${esc(cut(r.owner, 12))}/<tspan fill="${C.ink}" font-weight="700">${esc(cut(r.name, m ? 22 : 20))}</tspan>${tag}</text>`;
    const msg = `${r.message.slice(0, 20).trimEnd()}--------`;
    const date = r.date.slice(0, 10);
    if (m) b += t(x, y + 20, msg, { size: 10.5, fill: C.mute, mono: true }) + t(W - x, y + 20, date, { size: 10.5, fill: C.mute, mono: true, anchor: 'end' });
    else b += t(422, y, msg, { size: 11, fill: C.mute, mono: true }) + t(W - x, y, `${r.language?.replace(' Notebook', '') ?? 'Other'} · ${date}`, { size: 11, fill: C.mute, mono: true, anchor: 'end' });
    b += rule(x, W - x, y + (m ? 36 : 18), C.soft);
  });
  return svg(W, H, `Recently pushed repositories: ${list.map((r) => r.name).join(', ')}.`, b);
};

const role = ({ when, org, title, link, items }) => (m) => {
  const W = m ? 420 : 846, x = m ? 26 : 34;
  let b = label(x, 40, when);
  if (!m) b += t(W - x, 40, `${link} ↗`, { size: 12, fill: C.acc, mono: true, anchor: 'end' });
  b += t(x, 70, org, { size: m ? 20 : 24, w: 700, space: -0.4 }) + t(x, 93, title, { size: 14, fill: C.mute });
  b += rule(x, W - x, 112, C.soft) + `<rect x="${x}" y="111.25" width="56" height="1.5" fill="${C.acc}"/>`;
  let y = 140;
  for (const [name, text] of items) {
    b += sq(x + 1, y - 8);
    if (name) b += t(x + 15, y, name, { size: 14, w: 700 });
    const tx = m || !name ? x + 15 : x + 125;
    const p = para(tx, m && name ? y + 21 : y, text, (m ? W - x : W - 120) - tx, { size: m ? 13.5 : 14, fill: '#dcdad6' });
    b += p.svg;
    y += p.h + (m && name ? 21 : 0) + 10;
  }
  return svg(W, y + 8, `${org}, ${title}, ${when}. ${items.map((i) => i.filter(Boolean).join(': ')).join(' ')}`, b);
};

// small line drawings in the corner of each project card
const GLYPH = {
  wave: () => [6, 14, 26, 40, 22, 34, 48, 30, 16, 36, 20, 10, 6].map((h, i) => `<rect class="bar" style="animation-delay:-${(i * 0.17).toFixed(2)}s" x="${i * 8}" y="${30 - h / 2}" width="3" height="${h}" rx="1.5" fill="${i > 5 ? C.acc : '#8d8a83'}"/>`).join(''),
  barcode: () => [3, 1, 2, 1, 4, 1, 1, 3, 2, 1, 3, 1, 2].reduce((a, w) => ({ x: a.x + w * 2.6 + 3.4, s: `${a.s}<rect x="${a.x}" y="8" width="${w * 2.2}" height="44" fill="#d8d6d1"/>` }), { x: 0, s: '' }).s + `<rect class="scan" x="-4" y="12" width="106" height="2" fill="${C.acc}"/>`,
  search: () => `<rect x="10" y="2" width="54" height="62" rx="4" fill="#17171b" stroke="#3a3a42"/>${[14, 24, 34, 44].map((y, i) => `<rect x="18" y="${y}" width="${[38, 28, 36, 20][i]}" height="3" fill="${i === 1 ? C.acc : '#55535c'}"/>`).join('')}<circle cx="68" cy="42" r="15" fill="none" stroke="#d8d6d1" stroke-width="2.5"/><path d="M79 53l11 11" stroke="#d8d6d1" stroke-width="3" stroke-linecap="round"/>`,
  pitch: () => `<g fill="none" stroke="#8d8a83" stroke-width="1.5"><rect x="2" y="6" width="98" height="52" rx="2"/><path d="M51 6V58"/><circle cx="51" cy="32" r="11"/><path d="M2 20h15v24H2M100 20H85v24h15"/></g><circle class="blip" cx="72" cy="22" r="4" fill="${C.acc}"/>`,
};

const project = ({ name, text, stack, tag, glyph }) => (m) => {
  const W = 412, H = 214;
  let b = t(26, 44, name, { size: 20, w: 700, space: -0.3 });
  b += `<g transform="translate(${W - 112} 14) scale(.84)">${GLYPH[glyph]()}</g>`;
  b += para(26, 90, text, W - 56, { size: 13.5, fill: C.mute }, 20).svg;
  b += rule(26, W - 26, 172) + t(26, 195, stack, { size: 10.5, fill: C.mute, mono: true }) + t(W - 26, 195, tag, { size: 10.5, fill: C.acc, mono: true, anchor: 'end' });
  return svg(W, H, `${name}: ${text}`, b, {
    css: `.bar{transform-box:fill-box;transform-origin:center;animation:eq 1.8s ease-in-out infinite}@keyframes eq{50%{transform:scaleY(.45)}}
.scan{animation:sc 2.6s ease-in-out infinite}@keyframes sc{50%{transform:translateY(34px)}}
.blip{animation:bl 2s ease-in-out infinite}@keyframes bl{50%{opacity:.25}}`,
  });
};

const research = (m) => {
  const W = m ? 420 : 846, x = m ? 26 : 44;
  const rows = [
    ['Group', 'Stacked ensemble for cognitive symptoms in students at sleep risk', 'Paper forthcoming'],
    ['Course', 'Water turbidity classification from phone photos with fine-tuning', 'Computer vision'],
    ['Course', 'Early warning model for high-value customer drop-off', 'Data science'],
    ['Course', 'Twitter sentiment analysis with TF-IDF and Naïve Bayes', 'NLP'],
    ['Course', 'Explainable Bangla toxic comment detection with BanglaBERT', 'Data mining'],
  ];
  let b = label(x, 40, 'Research and ML studies') + (m ? '' : label(W - x, 40, 'AIUB', { anchor: 'end' }));
  let y = 80;
  for (const [kind, title, venue] of rows) {
    b += t(x, y, kind, { size: 11, fill: kind === 'Group' ? C.acc : C.mute, mono: true });
    if (m) {
      const p = para(x, y + 22, title, W - x * 2, { size: 13.5 });
      b += p.svg + t(W - x, y, venue, { size: 11, fill: C.mute, anchor: 'end' });
      y += p.h + 34;
    } else {
      b += t(112, y, title, { size: 14 }) + t(W - x, y, venue, { size: 12.5, fill: C.mute, anchor: 'end' });
      y += 40;
    }
    b += rule(x, W - x, y - (m ? 18 : 22), C.soft);
    if (m) y += 6;
  }
  return svg(W, y - 4, `Research and ML studies: ${rows.map((r) => r[1]).join('; ')}.`, b);
};

const overview = () => {
  const W = 412, H = 232, r = 52, circ = 2 * Math.PI * r;
  const share = total ? cc.restrictedContributionsCount / total : 0;
  let b = t(22, 36, 'GitHub, last 12 months', { size: 15, w: 700 });
  b += `<circle cx="90" cy="115" r="${r}" fill="none" stroke="${C.line}" stroke-width="6"/><circle class="ring" cx="90" cy="115" r="${r}" fill="none" stroke="${C.acc}" stroke-width="6" stroke-linecap="round" stroke-dasharray="${(circ * share).toFixed(1)} ${circ.toFixed(1)}" transform="rotate(-90 90 115)"/>`;
  b += t(90, 115, num(total), { size: 22, w: 700, anchor: 'middle' }) + t(90, 133, 'contributions', { size: 10.5, fill: C.mute, anchor: 'middle' });
  [[num(cc.totalCommitContributions), 'Public commits'], [num(cc.restrictedContributionsCount), 'Private'], [num(days.filter((d) => d.contributionCount).length), 'Active days'], [num(user.repositories.totalCount), 'Public repos']]
    .forEach(([v, l], i) => { const x = 180 + (i % 2) * 116, y = 94 + Math.floor(i / 2) * 58; b += t(x, y, v, { size: 22, w: 700 }) + label(x, y + 18, l, { size: 9.5, space: 0.8 }); });
  b += rule(22, W - 22, 188) + label(22, 212, `Ring: private share ${Math.round(share * 100)}%`, { size: 10 });
  return svg(W, H, `${total} contributions in twelve months, ${cc.restrictedContributionsCount} private.`, b);
};

const languages = () => {
  const W = 412, H = 232, count = new Map();
  for (const r of withPrivate ?? repos) for (const { size, node } of r.languages.edges) count.set(node.name, { n: (count.get(node.name)?.n ?? 0) + size, c: node.color || C.mute });
  const all = [...count].sort((a, z) => z[1].n - a[1].n), sum = all.reduce((s, [, v]) => s + v.n, 0) || 1;
  let b = t(22, 36, langTitle, { size: 15, w: 700 }), x = 22;
  for (const [, v] of all) { const w = (v.n / sum) * (W - 44); b += `<rect x="${x.toFixed(1)}" y="56" width="${Math.max(1, w - 1.5).toFixed(1)}" height="7" fill="${v.c}"/>`; x += w; }
  all.slice(0, 8).forEach(([name, v], i) => {
    const cx = 22 + (i % 2) * 190, y = 96 + Math.floor(i / 2) * 33;
    b += sq(cx, y - 8, v.c, 7) + t(cx + 15, y, cut(name, 17), { size: 12.5, w: 600 }) + t(cx + 176, y, `${((v.n / sum) * 100).toFixed(1)}%`, { size: 11, fill: C.mute, mono: true, anchor: 'end' }) + rule(cx, cx + 176, y + 11, C.soft);
  });
  return svg(W, H, `${langTitle}: ${all.slice(0, 8).map(([k]) => k).join(', ')}.`, b);
};

const level = (c) => {
  if (!c) return 0;
  const r = Math.sqrt(c / Math.max(1, best.contributionCount));
  return r < 0.2 ? 1 : r < 0.35 ? 2 : r < 0.6 ? 3 : 4;
};
const shade = (hex, k) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * k).toString(16).padStart(2, '0')).join('');

const iso = (m) => {
  const W = m ? 420 : 846, H = m ? 490 : 452, x = m ? 22 : 44;
  const ux = m ? 5.9 : 9.3, uy = ux * 0.53;
  const ox = m ? 40 : 150, oy = m ? 188 : 120;
  const P = (w, d) => [ox + (w - d) * ux + 6 * ux, oy + (w + d) * uy];
  const pts = (a) => a.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' ');
  let b = t(x, 42, 'Contributions, last 12 months', { size: 15, w: 700 });
  let cells = '';
  const order = weeks.flatMap((wk, w) => wk.contributionDays.map((day) => ({ w, d: new Date(day.date + 'T00:00:00Z').getUTCDay(), c: day.contributionCount }))).sort((a, z) => a.w + a.d - (z.w + z.d));
  for (const { w, d, c } of order) {
    const l = level(c), h = c ? 5 + Math.sqrt(c / best.contributionCount) * (m ? 44 : 78) : 0;
    const A = P(w, d), B = P(w + 0.9, d), D = P(w, d + 0.9), E = P(w + 0.9, d + 0.9);
    const up = ([px, py]) => [px, py - h];
    if (h) cells += `<polygon points="${pts([up(D), up(E), E, D])}" fill="${shade(RAMP[l], 0.55)}"/><polygon points="${pts([up(B), up(E), E, B])}" fill="${shade(RAMP[l], 0.75)}"/>`;
    cells += `<polygon points="${pts([up(A), up(B), up(E), up(D)])}" fill="${RAMP[l]}"/>`;
  }
  b += cells;
  let last = '', lastW = -9;
  weeks.forEach((wk, w) => {
    const mo = mon(wk.contributionDays[0].date);
    if (w && mo !== last && w - lastW >= 3) { const [px, py] = P(w, 7.8); b += label(px - (m ? 8 : 14), py + (m ? 12 : 12), mo, { size: m ? 8 : 10, anchor: 'end' }); lastW = w; }
    last = mo;
  });
  const top = [[num(total), 'Total', C.acc], [num(thisWeek), 'This week', C.ink], [num(best.contributionCount), `Best day · ${mon(best.date)} ${+best.date.slice(8)}`, C.ink]];
  top.forEach(([v, l, c], i) => {
    const tx = m ? 22 + [0, 110, 220][i] : 496 + [0, 100, 196][i], ty = m ? 90 : 68;
    b += t(tx, ty, v, { size: m ? 22 : 26, w: 700, fill: c }) + label(tx, ty + 20, l, { size: m ? 9 : 10 });
  });
  [[longest, 'Longest streak'], [current, 'Current streak']].forEach(([v, l], i) => {
    const tx = x + i * 124, ty = H - 52;
    b += `<text x="${tx}" y="${ty}" font-family="I,system-ui,sans-serif" font-size="26" font-weight="700" fill="${C.ink}">${v}<tspan font-size="12" fill="${C.mute}"> days</tspan></text>` + label(tx, ty + 22, l, { size: 10 });
  });
  const lx = W - (m ? 148 : 170);
  b += label(lx, H - 22, 'Less', { size: 9 }) + RAMP.map((c, i) => sq(lx + 36 + i * 13, H - 30, c, 9)).join('') + label(lx + 106, H - 22, 'More', { size: 9 });
  return svg(W, H, `Isometric contribution chart: ${total} contributions, best day ${best.contributionCount}, longest streak ${longest} days.`, b);
};

const grid = (m) => {
  const W = m ? 420 : 846, x = m ? 20 : 44;
  const shown = m ? weeks.slice(-30) : weeks;
  const pitch = m ? 12.6 : 9.8, top = 100;
  let b = t(x, 40, m ? 'Every day, last 30 weeks' : 'Every day of the year', { size: 15, w: 700 });
  shown.forEach((wk, i) => wk.contributionDays.forEach((day) => {
    b += `<rect x="${(x + i * pitch).toFixed(1)}" y="${top + new Date(day.date + 'T00:00:00Z').getUTCDay() * pitch}" width="${pitch - 2}" height="${pitch - 2}" rx="1.5" fill="${RAMP[level(day.contributionCount)]}"/>`;
  }));
  const gridW = shown.length * pitch, gridB = top + 7 * pitch;
  b += `<g class="walk">${cat(x - 6, top - 42, 40)}</g>`;
  const mix = [['Private work', cc.restrictedContributionsCount], ['Public commits', cc.totalCommitContributions], ['Pull requests', cc.totalPullRequestContributions], ['Issues', cc.totalIssueContributions]];
  const sum = mix.reduce((s, [, v]) => s + v, 0) || 1;
  const mx = m ? x : 602, mw = m ? W - 2 * x : W - 44 - mx;
  let y = m ? gridB + 36 : 40;
  b += t(mx, y, 'Activity mix', { size: 15, w: 700 });
  y += m ? 30 : 44;
  for (const [name, v] of mix) {
    const pct = (v / sum) * 100;
    b += t(mx, y, name, { size: 12.5 }) + t(mx + mw, y, pct && pct < 1 ? '<1%' : `${Math.round(pct)}%`, { size: 11, fill: C.mute, mono: true, anchor: 'end' });
    b += `<rect x="${mx}" y="${y + 6}" width="${mw}" height="3" fill="${C.line}"/><rect x="${mx}" y="${y + 6}" width="${((mw * pct) / 100).toFixed(1)}" height="3" fill="${C.acc}"/>`;
    y += 27;
  }
  return svg(W, m ? y + 4 : 196, `One square per day. Activity mix: ${mix.map(([k, v]) => `${k} ${v}`).join(', ')}.`, b, {
    css: `.walk{animation:wk 22s linear infinite alternate}@keyframes wk{to{transform:translateX(${(gridW - 30).toFixed(0)}px)}}`,
  });
};

const footer = (m) => {
  const W = m ? 420 : 846, H = m ? 150 : 124;
  let b = cat(W / 2 - 30, 14, 60);
  b += rule(m ? 22 : 44, W - (m ? 22 : 44), m ? 108 : 90);
  if (m) b += label(W / 2, 94, 'Thanks for stopping by', { anchor: 'middle' }) + t(W / 2, 132, 'sajidur.me', { size: 12, fill: C.acc, mono: true, anchor: 'middle' });
  else b += label(44, 76, 'Thanks for stopping by') + t(W - 44, 76, 'sajidsajidurrahman99@gmail.com', { size: 12, fill: C.acc, mono: true, anchor: 'end' }) + t(W / 2, 112, 'sajidur.me', { size: 11.5, fill: C.mute, mono: true, anchor: 'middle' });
  return svg(W, H, 'Thanks for stopping by. sajidur.me', b);
};

/* ---------------------------------------------------------------- content */
const roles = {
  lumifi: role({ when: 'Nov 2026 – now', org: 'Lumifi Solutions', title: 'Full-Stack Developer · remote, Sydney', link: 'case study', items: [
    ['Lumifi SMS', 'Multi-tenant student and learning platform for Australian training providers. I own Applications and Enrolments, from schema and migrations to server logic and UI.'],
    ['World Bridge', 'Staffing site with separate Australian-employer and Bangladeshi-candidate experiences on one domain.'],
  ] }),
  remoteintegrity: role({ when: 'Oct 2026 – now', org: 'RemoteIntegrity', title: 'Full-Stack Developer · contract, remote', link: 'case study', items: [
    ['Aria ERP', 'Building an external ERP for partner organisations, linking quotes to invoices and purchase orders to receipts.'],
    ['Core ERP', 'Maintaining and extending the company’s existing ERP system.'],
  ] }),
  ledgercross: role({ when: 'May – Sep 2026', org: 'Ledgercross', title: 'Software Developer · Dhaka', link: 'case studies', items: [
    ['InvoicePilot', 'Built the team’s FastAPI OCR, validation and fraud-detection service.'],
    ['FUMAK', 'Sole developer of an Android and Next.js inventory and point-of-sale system.'],
    ['NITOR', 'Built the frontend and contributed Convex backend logic for a trauma unit’s patient system.'],
  ] }),
  bss: role({ when: 'Feb – Apr 2026', org: 'Bangladesh Software Solution', title: 'Software Engineer Intern · Dhaka', link: 'experience', items: [
    ['', 'Built responsive interfaces with HTML, CSS and JavaScript and wired them to REST APIs.'],
  ] }),
};
const projects = {
  voicecon: project({ name: 'VoiceCon', glyph: 'wave', tag: 'voicecon.app', stack: 'Kotlin · Fastify · Twilio · PyTorch', text: 'Live AI voice conversion over normal phone calls: Android app, backend, media gateway and GPU worker.' }),
  fumak: project({ name: 'FUMAK', glyph: 'barcode', tag: 'live', stack: 'Kotlin · Next.js · Prisma · Neon', text: 'Barcode scanning on Android, with checkout, stock and sales reporting for a retail store.' }),
  casevault: project({ name: 'CaseVault', glyph: 'search', tag: 'open source', stack: 'FastAPI · Next.js · SQLAlchemy', text: 'Legal research for Bangladeshi law: ranked search over statutes and judgements, with a document reader.' }),
  ledgerturf: project({ name: 'LedgerTurf', glyph: 'pitch', tag: 'open source', stack: 'React · Express · MongoDB · Maps', text: 'Turf booking for Dhaka: find grounds on a map, publish slots, and block overlapping reservations.' }),
};

const wide = { header, available, stats, now, research, iso, grid, footer, ...Object.fromEntries(Object.entries(roles).map(([k, v]) => [`role-${k}`, v])) };
const cards = Object.fromEntries(Object.entries(projects).map(([k, v]) => [`project-${k}`, v]));

mkdirSync(new URL('assets/', root), { recursive: true });
const write = (name, data) => {
  if (data.length > 400_000) throw new Error(`${name} is too large (${data.length} bytes)`);
  if (!name.startsWith('now') && /NaN|undefined/.test(data.replace(/data:[^")]+/g, ''))) throw new Error(`${name} has a bad value`);
  writeFileSync(new URL(`assets/${name}.svg`, root), data + '\n');
};
for (const [k, f] of Object.entries(wide)) { write(k, f(false)); write(`${k}-m`, f(true)); }
for (const [k, f] of Object.entries(cards)) write(k, f(false));
write('overview', overview());
write('languages', languages());
const badges = { site: ['sajidur.me'], resume: ['Résumé'], linkedin: ['LinkedIn'], email: ['Email', true] };
for (const [k, [s, solid]] of Object.entries(badges)) write(`badge-${k}`, badge(s, solid));

/* ---------------------------------------------------------------- README */
const S = 'https://www.sajidur.me';
const MAIL = 'mailto:sajidsajidurrahman99@gmail.com';
const IN = 'https://www.linkedin.com/in/sajidur-rahman-sajid/';
const full = (name, href, alt) => {
  const img = `<picture><source media="(max-width: 600px)" srcset="assets/${name}-m.svg"><img src="assets/${name}.svg" width="100%" alt="${esc(alt)}"></picture>`;
  return href ? `<a href="${href}">${img}</a>` : img;
};
// fixed-width halves: side by side on desktop, stacked at full width on a phone
const half = (name, href, alt) => `<a href="${href}"><img src="assets/${name}.svg" width="412" alt="${esc(alt)}"></a>`;

const readme = `${full('header', S, 'Sajidur Rahman Sajid, full-stack software engineer, AI/ML, Dhaka')}

I'm **Sajidur Rahman Sajid**, a full-stack software engineer in Dhaka, Bangladesh. I'm a developer at [Lumifi Solutions](${S}/projects/lumifi-sms) and a contract developer at [RemoteIntegrity](${S}/projects/aria-erp), and I hold a B.Sc. in Computer Science and Engineering from AIUB. I build web and mobile systems, with AI/ML as a specialty: realtime voice conversion, document extraction and applied machine learning.

**Website: [sajidur.me](${S})** · [About me](${S}/about) · [Case studies](${S}/projects) · [Résumé](${S}/resume) · [Research](${S}/research/neuronscreen)

<p align="center">
<a href="${S}"><img src="assets/badge-site.svg" alt="sajidur.me"></a>
<a href="${S}/resume"><img src="assets/badge-resume.svg" alt="Résumé"></a>
<a href="${IN}"><img src="assets/badge-linkedin.svg" alt="LinkedIn"></a>
<a href="${MAIL}"><img src="assets/badge-email.svg" alt="Email"></a>
</p>

${full('available', MAIL, 'Open to better opportunities: full stack, AI/ML engineering, freelance')}

${full('stats', S, statsAlt)}

${full('now', `https://github.com/${LOGIN}?tab=repositories&sort=pushed`, 'Recently pushed repositories')}

${full('role-lumifi', `${S}/projects/lumifi-sms`, 'Full-Stack Developer at Lumifi Solutions')}

${full('role-remoteintegrity', `${S}/projects/aria-erp`, 'Full-Stack Developer, contract, at RemoteIntegrity')}

${full('role-ledgercross', `${S}/projects`, 'Software Developer at Ledgercross')}

${full('role-bss', `${S}/#experience`, 'Software Engineer Intern at Bangladesh Software Solution')}

<p align="center">
${half('project-voicecon', 'https://voicecon.app/', 'VoiceCon')}
${half('project-fumak', 'https://fumak-inventory.vercel.app/', 'FUMAK Inventory')}
${half('project-casevault', 'https://github.com/Saji-d/casevault', 'CaseVault')}
${half('project-ledgerturf', 'https://github.com/Saji-d/ledgerturf', 'LedgerTurf')}
</p>

Case studies: [VoiceCon](${S}/projects/voicecon) · [InvoicePilot](${S}/projects/invoicepilot) · [Lumifi SMS](${S}/projects/lumifi-sms) · [World Bridge](${S}/projects/world-bridge) · [Aria ERP](${S}/projects/aria-erp). Live: [CaseVault](https://casevault-bd.vercel.app/) · [LedgerTurf](https://ledgerturf.vercel.app/) · [NITOR](https://dr-stone.vercel.app/)

${full('research', `${S}/research/neuronscreen`, 'Research and machine learning studies')}

Neuro-Screen: [study](${S}/research/neuronscreen) · [code](https://github.com/Saji-d/neuro-screen) · [app](https://neuro-screen.streamlit.app/). I built the Streamlit app and ran the re-analysis for our AIUB group.

<p align="center">
${half('overview', `https://github.com/${LOGIN}`, 'GitHub activity overview, last 12 months')}
${half('languages', `https://github.com/${LOGIN}?tab=repositories`, langTitle)}
</p>

${full('iso', '', 'Isometric contribution chart, last 12 months')}

${full('grid', '', 'Contribution grid and activity mix')}

${full('footer', S, 'Thanks for stopping by')}
`;
writeFileSync(new URL('README.md', root), readme);
console.log(`built ${Object.keys(wide).length * 2 + Object.keys(cards).length + 6} cards: ${total} contributions`);
