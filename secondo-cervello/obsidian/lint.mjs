#!/usr/bin/env node
// Vault lint for the second brain defined in ai-kit secondo-cervello/obsidian/SPEC.md (section 10).
// Report-only: it reads the vault and writes nothing. Exact checks only, no guessing on content.
//
//   node scripts/lint.mjs      run from the vault root; Node >= 22, no dependencies.
//   Exit 0: no errors (notices may remain). Exit 1: at least one error. Exit 2: wrong environment.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

if (Number(process.versions.node.split('.')[0]) < 22) {
  console.error(`lint.mjs needs Node 22 or newer (found ${process.versions.node}).`);
  process.exit(2);
}

const ROOT = process.cwd();
if (!existsSync(join(ROOT, 'AGENTS.md')) || !existsSync(join(ROOT, 'wiki'))) {
  console.error('Run lint.mjs from the vault root (the folder with AGENTS.md and wiki/).');
  process.exit(2);
}

/** Folders whose Markdown files are pages. */
const PAGE_DIRS = ['wiki', 'domains', 'people', 'daily'];
/** Folders never used as link targets or scanned. */
const SKIP_DIRS = new Set(['.git', '.obsidian', '.trash', 'node_modules']);
/** Meta pages: no frontmatter contract, exempt from orphan and round-trip checks. Index pages may be split per domain. */
const META = new Set(['wiki/overview.md', 'wiki/contradictions.md', 'wiki/tag-dictionary.md']);
const isIndex = (path) => /^wiki\/index(-[a-z0-9-]+)?\.md$/.test(path);
const isMeta = (path) => META.has(path) || isIndex(path);
const TYPES = new Set(['concept', 'entity', 'source', 'synthesis', 'question', 'meeting', 'decision', 'person', 'moc', 'daily']);
const STATUSES = new Set(['active', 'hypothesis', 'archived', 'contradicted', 'superseded']);
/** Folders whose pages must be listed in wiki/index.md, with their outgoing-link floor. */
const INDEXED = { 'wiki/concepts/': 3, 'wiki/entities/': 2, 'wiki/sources/': 1, 'wiki/syntheses/': 3, 'wiki/questions/': 1 };
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86_400_000;
const NOW = Date.now();

const errors = new Map(); // check -> [{ file, line, message }]
const notices = new Map();
const add = (bucket, check, file, line, message) => {
  if (!bucket.has(check)) bucket.set(check, []);
  bucket.get(check).push({ file, line, message });
};
const error = (...args) => add(errors, ...args);
const notice = (...args) => add(notices, ...args);

/** Every file under dir, as vault-relative POSIX paths. */
function walk(dir) {
  const out = [];
  if (!existsSync(join(ROOT, dir))) return out;
  for (const entry of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const path = dir ? `${dir}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...walk(path));
    else if (entry.isFile()) out.push(path);
  }
  return out;
}

const allFiles = walk('');
const fileSet = new Set(allFiles);
const byBasename = new Map(); // "name" (no .md) -> [paths]
for (const path of allFiles) {
  const base = path.split('/').pop().replace(/\.md$/, '');
  if (!byBasename.has(base)) byBasename.set(base, []);
  byBasename.get(base).push(path);
}

const isPage = (path) =>
  path.endsWith('.md') && PAGE_DIRS.some((d) => path.startsWith(`${d}/`)) && !/(^|\/)(CLAUDE|AGENTS)\.md$/.test(path);
const isHub = (path) => isMeta(path) || path.endsWith('/_moc.md') || path.startsWith('daily/');
const pages = allFiles.filter(isPage);
const domains = new Set(
  existsSync(join(ROOT, 'domains'))
    ? readdirSync(join(ROOT, 'domains'), { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)
    : [],
);

/** Lines with code removed: fenced blocks become empty lines, inline code becomes spaces. */
function proseLines(text) {
  let fence = null;
  return text.split('\n').map((line) => {
    const opener = line.match(/^\s*(`{3,}|~{3,})/);
    if (fence) {
      if (opener && opener[1][0] === fence[0] && opener[1].length >= fence.length && !line.slice(opener[0].length).trim()) fence = null;
      return '';
    }
    if (opener) {
      fence = opener[1];
      return '';
    }
    return line.replace(/(`+)[^`]*?\1/g, (code) => ' '.repeat(code.length));
  });
}

/** Minimal YAML subset: `key: value`, `key: [a, b]`, and `key:` followed by `- item` lines. */
function parseFrontmatter(text) {
  if (!text.startsWith('---\n')) return null;
  const end = text.indexOf('\n---', 3);
  if (end === -1) return null;
  const data = {};
  let listKey = null;
  const unquote = (s) => s.trim().replace(/^(["'])(.*)\1$/, '$2');
  for (const line of text.slice(4, end).split('\n')) {
    const item = line.match(/^\s+-\s+(.*)$/);
    if (item && listKey) {
      data[listKey].push(unquote(item[1]));
      continue;
    }
    const pair = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!pair) continue;
    const [, key, raw] = pair;
    listKey = null;
    if (raw === '') {
      data[key] = [];
      listKey = key;
    } else if (raw.startsWith('[') && raw.endsWith(']') && !raw.startsWith('[[')) {
      data[key] = raw.slice(1, -1).split(',').map(unquote).filter(Boolean);
    } else {
      data[key] = unquote(raw);
    }
  }
  return { data, lines: text.slice(0, end + 4).split('\n').length };
}

const WIKILINK = /!?\[\[([^\]|#]*)(?:#[^\]|]*)?(?:\|[^\]]*)?\]\]/g;

/** Resolves a wikilink target to a vault path, or returns an error string. */
function resolve(target) {
  const t = target.trim().replace(/\\$/, '').replace(/^\/+/, ''); // a trailing \ escapes the | of an alias inside a table
  if (!t) return { path: null, error: 'empty link' };
  for (const candidate of [`${t}.md`, t]) if (fileSet.has(candidate)) return { path: candidate };
  if (!t.includes('/')) {
    // Prefer pages: a source page and its raw file share a basename by design.
    const all = byBasename.get(t.replace(/\.md$/, '')) ?? [];
    const pageMatches = all.filter(isPage);
    const matches = pageMatches.length ? pageMatches : all;
    if (matches.length === 1) return { path: matches[0] };
    if (matches.length > 1) return { path: null, error: `ambiguous: matches ${matches.join(', ')}` };
  }
  return { path: null, error: 'no such file' };
}

// Pass 1: parse every page, collect links.
const info = new Map(); // path -> { fm, links: Map<target, first line>, body: lines without frontmatter and code }
for (const path of pages) {
  const text = readFileSync(join(ROOT, path), 'utf8').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const fm = parseFrontmatter(text);
  const links = new Map();
  const body = proseLines(text).map((line, i) => (fm && i < fm.lines ? '' : line));
  body.forEach((line, i) => {
    for (const match of line.matchAll(WIKILINK)) {
      if (!match[1].trim()) continue; // [[#heading]]: a link inside the same page
      const { path: to, error: why } = resolve(match[1]);
      if (to) {
        if (!links.has(to)) links.set(to, i + 1);
      } else error('dead-link', path, i + 1, `[[${match[1]}]]: ${why}`);
    }
  });
  // Wikilinks quoted in frontmatter (people:, superseded_by:) count as links too.
  if (fm) for (const value of Object.values(fm.data).flat()) {
    for (const match of String(value).matchAll(WIKILINK)) {
      if (!match[1].trim()) continue;
      const { path: to, error: why } = resolve(match[1]);
      if (to) links.set(to, links.get(to) ?? 1);
      else error('dead-link', path, 1, `[[${match[1]}]] in frontmatter: ${why}`);
    }
  }
  info.set(path, { fm, links, body });
}

const incoming = new Map(pages.map((p) => [p, new Set()]));
for (const [from, { links }] of info) for (const to of links.keys()) incoming.get(to)?.add(from);

const dictionary = existsSync(join(ROOT, 'wiki/tag-dictionary.md'))
  ? new Set([...readFileSync(join(ROOT, 'wiki/tag-dictionary.md'), 'utf8').matchAll(/^\s*-\s+`([^`]+)`/gm)].map((m) => m[1]))
  : null;
const indexLinks = new Set([...info].filter(([p]) => isIndex(p)).flatMap(([, { links }]) => [...links.keys()]));
const contradictionLinks = info.get('wiki/contradictions.md')?.links ?? new Map();
const cited = new Set();

// Pass 2: per-page checks.
for (const [path, { fm, links, body }] of info) {
  if (!isMeta(path)) {
    if (!fm) error('frontmatter', path, 1, 'missing frontmatter block');
    else {
      const d = fm.data;
      for (const key of ['type', 'domain', 'tags', 'created', 'updated', 'status']) {
        if (d[key] === undefined) error('frontmatter', path, 1, `missing key "${key}"`);
      }
      if (d.type !== undefined && !TYPES.has(d.type)) error('frontmatter', path, 1, `unknown type "${d.type}"`);
      if (d.status !== undefined && !STATUSES.has(d.status)) error('frontmatter', path, 1, `unknown status "${d.status}"`);
      for (const key of ['created', 'updated']) {
        if (d[key] !== undefined && !DATE.test(d[key])) error('frontmatter', path, 1, `${key} is not YYYY-MM-DD`);
      }
      if (d.domain !== undefined && d.domain !== 'global' && !domains.has(d.domain)) {
        error('frontmatter', path, 1, `domain "${d.domain}" is not a folder under domains/`);
      }
      const tags = Array.isArray(d.tags) ? d.tags : d.tags ? [d.tags] : [];
      if (tags.length && !dictionary) error('tags', path, 1, 'wiki/tag-dictionary.md is missing');
      else for (const tag of tags) if (!dictionary.has(tag)) error('tags', path, 1, `tag "${tag}" is not in wiki/tag-dictionary.md`);

      const sources = Array.isArray(d.sources) ? d.sources : d.sources ? [d.sources] : [];
      if (path.startsWith('wiki/') && sources.length === 0 && d.status !== 'hypothesis') {
        error('sources', path, 1, 'no sources: and status is not hypothesis');
      }
      for (const source of sources) {
        const wl = source.match(/^\[\[([^\]|#]*)/);
        const target = wl ? resolve(wl[1]).path : fileSet.has(source) ? source : null;
        if (target) cited.add(target);
        else error('sources', path, 1, `source "${source}" does not exist`);
      }

      if (d.domain && d.domain !== 'global' && path !== `domains/${d.domain}/_moc.md`) {
        if (!links.has(`domains/${d.domain}/_moc.md`)) error('hub-anchor', path, 1, `does not link [[domains/${d.domain}/_moc]]`);
      }
      if (d.updated && DATE.test(d.updated) && (NOW - Date.parse(d.updated)) / DAY_MS > 180) {
        notice('stale', path, 1, `updated ${d.updated}`);
      }
    }

    const folder = Object.keys(INDEXED).find((f) => path.startsWith(f));
    if (folder) {
      if (!indexLinks.has(path)) error('unindexed', path, 1, 'not linked from wiki/index.md or a wiki/index-<domain>.md');
      const outgoing = [...links.keys()].filter((to) => to !== path && info.has(to));
      const counted = folder === 'wiki/sources/'
        ? outgoing.filter((to) => to.startsWith('wiki/concepts/') || to.startsWith('wiki/entities/'))
        : outgoing;
      if (counted.length < INDEXED[folder]) {
        const what = folder === 'wiki/sources/' ? 'links into concepts or entities' : 'outgoing links';
        error('density', path, 1, `${counted.length} ${what}, floor ${INDEXED[folder]}`);
      }
    }

    if (!isHub(path) && ![...incoming.get(path)].some((from) => !isIndex(from))) {
      error('orphan', path, 1, 'no incoming link except from the index');
    }
    if (!isHub(path)) for (const [to, line] of links) {
      if (info.has(to) && to !== path && !isHub(to) && !info.get(to).links.has(path)) {
        error('round-trip', path, line, `links ${to}, which does not link back`);
      }
    }
  }

  body.forEach((line, i) => {
    if (/^\s*[-*+]\s+\[ \]/.test(line) && !/\[\[people\//.test(line)) {
      error('owner', path, i + 1, 'open action item without [[people/…]] owner');
    }
    const callout = line.match(/^\s*>\s*\[!(contradiction|blocker)\][+-]?\s*(.*)$/i);
    if (!callout) return;
    const date = callout[2].match(/\d{4}-\d{2}-\d{2}/)?.[0];
    const kind = callout[1].toLowerCase();
    if (kind === 'blocker') {
      notice('blockers', path, i + 1, callout[2].trim() || '(no title)');
      return;
    }
    if (!date) error('contradictions', path, i + 1, 'contradiction callout without a YYYY-MM-DD date in its title');
    else if ((NOW - Date.parse(date)) / DAY_MS > 30) notice('contradictions', path, i + 1, `open since ${date}`);
    if (path !== 'wiki/contradictions.md' && !contradictionLinks.has(path)) {
      error('contradictions', path, i + 1, 'page with an open contradiction is not linked from wiki/contradictions.md');
    }
  });
}

// Vault-level notices.
for (const path of walk('inbox')) {
  if (path.endsWith('.gitkeep')) continue;
  const days = (NOW - statSync(join(ROOT, path)).mtimeMs) / DAY_MS;
  if (days > 7) notice('inbox', path, 0, `waiting ${Math.floor(days)} days`);
}
for (const path of walk('raw')) {
  if (path.startsWith('raw/_archive/') || path.endsWith('.gitkeep')) continue;
  if (!cited.has(path)) notice('uncompiled', path, 0, 'no page lists it in sources:');
}

function print(title, bucket) {
  if (!bucket.size) return 0;
  let total = 0;
  console.log(`\n${title}`);
  for (const [check, items] of [...bucket].sort(([a], [b]) => a.localeCompare(b))) {
    console.log(`  ${check} (${items.length})`);
    for (const { file, line, message } of items) console.log(`    ${file}${line ? `:${line}` : ''}  ${message}`);
    total += items.length;
  }
  return total;
}

const errorCount = print('Errors', errors);
const noticeCount = print('Notices', notices);
console.log(`\n${pages.length} pages checked: ${errorCount} errors, ${noticeCount} notices.`);
process.exit(errorCount ? 1 : 0);
