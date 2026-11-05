#!/usr/bin/env node
// Repository checks for ai-kit: size budgets, copies in sync, public-safety patterns, links to the repo.
//
//   node scripts/check.mjs        Node >= 22, no dependencies, exit 1 on any problem.
//
// Scans every file git tracks or would track (untracked files that are not ignored count too):
// the text of each file and its path. Binary files are reported until someone has reviewed them.
// Extra patterns: scripts/denylist.txt (public, generic) and CHECK_DENYLIST (private, one regex
// per line; CI passes the repository secret on push to main only). Safety findings print
// file:line:col and the rule name, never the matched text, because CI logs of a public repo are public.
// A false positive: add `check:allow=<rule>[,<rule>]` to that line, e.g. <!-- check:allow=indeck-id -->.
// Only the rules in ALLOWABLE can be allowed; credentials and denylist matches never can.

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';

if (Number(process.versions.node.split('.')[0]) < 22) {
  console.error(`check.mjs needs Node 22 or newer (found ${process.versions.node}).`);
  process.exit(2);
}

const ROOT = resolve(import.meta.dirname, '..');

/**
 * Line budgets count the whole file; char budgets count the pasteable text between the markers.
 * Every other Markdown file except CHANGELOG.md gets DEFAULT_MD_LINES.
 */
const BUDGETS = {
  'README.md': { lines: 120 },
  'AGENTS.md': { lines: 120 },
  'inizia/modelli/CLAUDE-globale.md': { lines: 60 },
  'inizia/modelli/CLAUDE-cartella.md': { lines: 80 },
  'kit/primo-workspace/CLAUDE.md': { lines: 80 },
  'org/rendering/claude-ai.md': { chars: 3000 },
  'org/rendering/indeck-mcp-server-instructions.md': { chars: 2000 },
};
const DEFAULT_MD_LINES = 250;
const UNBUDGETED = new Set(['CHANGELOG.md']);
const BEGIN = '<!-- begin -->';
const END = '<!-- end -->';

const ALLOWED_EMAILS = new Set(['noreply@anthropic.com', 'git@github.com']);

/** Rules a `check:allow=<rule>` marker may switch off for one line. */
const ALLOWABLE = new Set(['email', 'indeck-id', 'cloud-host', 'money']);
const ALLOW_MARKER = /check:allow=([a-z,-]+)/;

/** Binary files a maintainer has opened and checked (content and metadata). Paths, exact case. */
const BINARY_ALLOW = new Set([]);

/** Intentional copies: [source, copy, what, the part that must be identical]. checkSync also checks the org copy. */
const TEXT_FENCE = /^```text\n([\s\S]*?)^```$/m;
const COPIES = [
  ['inizia/modelli/CLAUDE-cartella.md', 'kit/primo-workspace/CLAUDE.md', 'file', (text) => text],
  ['inizia/prompt-di-setup.md', 'kit/primo-workspace/LEGGIMI.md', 'setup prompt block', (text) => text.match(TEXT_FENCE)?.[1]],
];

/** Absolute links to this repository's main branch; check.mjs resolves them against the tree. */
const SELF_URL = /https:\/\/(?:github\.com\/IntargetGroup\/ai-kit\/(?:blob|tree)\/main|raw\.githubusercontent\.com\/IntargetGroup\/ai-kit\/main)(?:\/([^\s)>\]"'`«»<]*))?/g;

/** Built-in safety rules: [name, what it means, regex, optional filter on the match]. */
const SAFETY = [
  ['email', 'email address', /[A-Za-z0-9._%+-]+@(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,}/g,
    (m) => !ALLOWED_EMAILS.has(m.toLowerCase()) && !/@example\.(?:com|org|net)$/i.test(m)],
  // Indeck workspace/project ids are 21-char nanoids; requiring all three character classes
  // keeps kebab-case words and camelCase setting names out.
  ['indeck-id', 'looks like an Indeck id (21-char nanoid)', /(?<![A-Za-z0-9_-])[A-Za-z0-9_-]{21}(?![A-Za-z0-9_-])/g,
    (m) => /[a-z]/.test(m) && /[A-Z]/.test(m) && /\d/.test(m)],
  ['credential', 'looks like a key or token',
    /(?<![A-Za-z0-9])(?:sk-[A-Za-z0-9_-]{20,}|sb_(?:publishable|secret)_[A-Za-z0-9_-]{10,}|gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AIza[A-Za-z0-9_-]{30,}|xox[abpr]-[A-Za-z0-9-]{10,})|-{5}BEGIN/g],
  ['cloud-host', 'internal cloud host or region', /\brun\.app\b|\beurope-west\d\b/g],
  ['money', 'currency amount',
    /€\s?\d|\d[\d.,]*\s?[kKmM]?\s?€|\$\d|\d[\d.,]*\s?[kK]\$|\b\d[\d.,]*\s?(?:euro|EUR|USD|dollari)\b/g],
];

const problems = { budgets: [], sync: [], safety: [], links: [] };
const report = (kind, file, line, col, message) => problems[kind].push({ file, line, col, message });

function listFiles() {
  const out = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { cwd: ROOT });
  const files = [];
  for (const path of out.toString('utf8').split('\0').filter(Boolean)) {
    let buf;
    try {
      buf = readFileSync(join(ROOT, path));
    } catch {
      continue; // deleted in the working tree, or a directory entry (submodule)
    }
    if (buf.subarray(0, 8000).includes(0)) {
      // Patterns cannot read a screenshot, a PDF or a .DS_Store; a person must. The path is still checked.
      if (!BINARY_ALLOW.has(path)) report('safety', path, 0, 0, 'binary file: open it and check content and metadata, then add its path to BINARY_ALLOW in scripts/check.mjs');
      files.push({ path, text: null });
      continue;
    }
    files.push({ path, text: buf.toString('utf8').replace(/\r\n/g, '\n') });
  }
  return files;
}

function loadDenylist() {
  const sources = [];
  try {
    sources.push(['scripts/denylist.txt', readFileSync(join(ROOT, 'scripts/denylist.txt'), 'utf8')]);
  } catch {
    report('safety', 'scripts/denylist.txt', 0, 0, 'missing');
  }
  if (process.env.CHECK_DENYLIST) sources.push(['CHECK_DENYLIST', process.env.CHECK_DENYLIST]);
  else if (process.env.CHECK_DENYLIST_REQUIRED === '1') {
    report('safety', 'CHECK_DENYLIST', 0, 0, 'empty: private patterns were not checked (set the repository secret)');
  }
  const rules = [];
  for (const [source, text] of sources) {
    text.split(/\r?\n/).forEach((raw, i) => {
      const pattern = raw.trim();
      if (!pattern || pattern.startsWith('#')) return;
      try {
        // u: \p{L} works, so a pattern can mark word edges next to accented letters (\b cannot).
        rules.push(['denylist', `matches ${source} line ${i + 1}`, new RegExp(pattern, 'giu')]);
      } catch (error) {
        // The engine's message quotes the pattern: never print it for the private list.
        report('safety', source, i + 1, 1, source === 'CHECK_DENYLIST' ? 'invalid regex' : `invalid regex: ${error.message}`);
      }
    });
  }
  return rules;
}

function countLines(text) {
  if (!text) return 0;
  return text.split('\n').length - (text.endsWith('\n') ? 1 : 0);
}

function checkBudgets(files) {
  const paths = new Set(files.map((f) => f.path));
  for (const path of Object.keys(BUDGETS)) {
    if (!paths.has(path)) report('budgets', path, 0, 0, 'missing (it has a budget)');
  }
  for (const { path, text } of files) {
    if (!path.endsWith('.md') || UNBUDGETED.has(path) || text === null) continue;
    const budget = BUDGETS[path] ?? { lines: DEFAULT_MD_LINES };
    if (budget.lines !== undefined) {
      const lines = countLines(text);
      if (lines > budget.lines) report('budgets', path, 0, 0, `${lines} lines, budget ${budget.lines}`);
    }
    if (budget.chars !== undefined) {
      const start = text.indexOf(BEGIN);
      const stop = text.indexOf(END);
      if (start === -1 || stop === -1 || stop < start || text.indexOf(BEGIN, start + 1) !== -1) {
        report('budgets', path, 0, 0, `needs exactly one ${BEGIN} followed by one ${END}`);
        continue;
      }
      const chars = [...text.slice(start + BEGIN.length, stop).trim()].length;
      if (chars > budget.chars) report('budgets', path, 0, 0, `${chars} characters between the markers, budget ${budget.chars}`);
    }
  }
}

// The org instructions exist once (org/rendering/claude-ai.md, between the markers).
// The managed-settings JSON carries a copy in `claudeMd`; the two must stay identical.
// The pairs in COPIES must stay identical too: Claude must not behave differently by download path.
function checkSync(files) {
  const byPath = new Map(files.map((f) => [f.path, f.text]));
  for (const [sourcePath, copyPath, what, part] of COPIES) {
    const source = byPath.get(sourcePath);
    const copy = byPath.get(copyPath);
    if (typeof source !== 'string' || typeof copy !== 'string') {
      report('sync', copyPath, 0, 0, `${sourcePath} and ${copyPath} must both exist`);
      continue;
    }
    const [a, b] = [part(source), part(copy)];
    if (a === undefined || b === undefined) report('sync', copyPath, 0, 0, `${what} not found in ${a === undefined ? sourcePath : copyPath}`);
    else if (a !== b) report('sync', copyPath, 0, 0, `${what} differs from ${sourcePath}: copy it again`);
  }
  const source = byPath.get('org/rendering/claude-ai.md');
  const json = byPath.get('org/rendering/claude-code-managed-settings.json');
  if (typeof source !== 'string' || typeof json !== 'string') {
    report('sync', 'org/rendering', 0, 0, 'claude-ai.md and claude-code-managed-settings.json must both exist');
    return;
  }
  const start = source.indexOf(BEGIN);
  const stop = source.indexOf(END);
  if (start === -1 || stop < start) return; // checkBudgets already reports the markers
  const block = source.slice(start + BEGIN.length, stop).trim();
  let claudeMd;
  try {
    claudeMd = JSON.parse(json).claudeMd;
  } catch (error) {
    report('sync', 'org/rendering/claude-code-managed-settings.json', 0, 0, `invalid JSON: ${error.message}`);
    return;
  }
  if (typeof claudeMd !== 'string' || claudeMd.trim() !== block) {
    report('sync', 'org/rendering/claude-code-managed-settings.json', 0, 0,
      'claudeMd differs from the block in org/rendering/claude-ai.md: copy the block again');
  }
}

let allowedMatches = 0;

function checkSafety(files, rules) {
  const scan = (path, line, lineNo, allow) => {
    for (const [name, meaning, regex, keep] of rules) {
      for (const match of line.matchAll(regex)) {
        if (keep && !keep(match[0])) continue;
        if (allow.has(name)) allowedMatches++;
        else report('safety', path, lineNo, lineNo && match.index + 1, `${name}${lineNo ? '' : ' in the file path'}: ${meaning}`);
      }
    }
  };
  for (const { path, text } of files) {
    scan(path, path, 0, new Set());
    if (text === null) continue;
    text.split('\n').forEach((line, i) => {
      const names = line.match(ALLOW_MARKER)?.[1].split(',') ?? [];
      for (const name of names) {
        if (!ALLOWABLE.has(name)) report('safety', path, i + 1, 1, `check:allow=${name}: only ${[...ALLOWABLE].join(', ')} can be allowed`);
      }
      scan(path, line, i + 1, new Set(names.filter((name) => ALLOWABLE.has(name))));
    });
  }
}

const INLINE_LINK = /!?\[(?:[^\]\\]|\\.)*\]\(\s*(<[^>]*>|[^\s)]+)(?:\s+(?:"[^"]*"|'[^']*'|\([^)]*\)))?\s*\)/g;
const REFERENCE_DEF = /^ {0,3}\[[^\]]+\]:\s*(<[^>]*>|\S+)/g;

function checkLinks(files) {
  // Targets must be paths git knows, with exact case: macOS and Windows hide case typos that break on GitHub.
  const known = new Set(['']);
  for (const { path } of files) {
    for (let p = path; p !== '.' && !known.has(p); p = dirname(p)) known.add(p);
  }
  for (const { path, text } of files) {
    if (!path.endsWith('.md') || text === null) continue;
    let fence = null;
    text.split('\n').forEach((line, i) => {
      // Absolute links to this repo, fenced prompts included: the setup prompt downloads by URL.
      // External link checkers skip them, because a new file is not on main before its PR merges.
      for (const match of line.matchAll(SELF_URL)) {
        const url = match[0].replace(/[.,;:]+$/, '');
        const target = (match[1] ?? '').replace(/[.,;:]+$/, '').split(/[#?]/)[0].replace(/\/$/, '');
        if (!known.has(target)) report('links', path, i + 1, match.index + 1, `${url}: not in the repository (check the path and its case)`);
      }
      // Any indent: fenced blocks inside list items (setup steps) must not count as links.
      const opener = line.match(/^\s*(`{3,}|~{3,})/);
      if (fence) {
        if (opener && opener[1][0] === fence[0] && opener[1].length >= fence.length && !line.slice(opener[0].length).trim()) fence = null;
        return;
      }
      if (opener) {
        fence = opener[1];
        return;
      }
      const visible = line.replace(/(`+)(?:(?!\1)[^])*?\1/g, (code) => ' '.repeat(code.length));
      for (const regex of [INLINE_LINK, REFERENCE_DEF]) {
        for (const match of visible.matchAll(regex)) {
          const error = resolveLink(path, match[1], known);
          if (error) report('links', path, i + 1, match.index + 1, `${match[1]}: ${error}`);
        }
      }
    });
  }
}

function resolveLink(from, raw, known) {
  let target = raw.startsWith('<') ? raw.slice(1, -1) : raw;
  if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith('#') || target.startsWith('//')) return null;
  target = target.split('#')[0].split('?')[0];
  try {
    target = decodeURIComponent(target);
  } catch {
    return 'malformed URL encoding';
  }
  const absolute = target.startsWith('/') ? join(ROOT, target) : resolve(ROOT, dirname(from), target);
  const rel = relative(ROOT, absolute);
  if (rel === '..' || rel.startsWith(`..${sep}`) || isAbsolute(rel)) return 'points outside the repository';
  return known.has(rel.split(sep).join('/')) ? null : 'not found (check the path and its case)';
}

let files;
try {
  files = listFiles();
} catch (error) {
  console.error(`check.mjs needs git and a git checkout: ${error.message}`);
  process.exit(2);
}
checkBudgets(files);
checkSync(files);
checkSafety(files, [...SAFETY, ...loadDenylist()]);
checkLinks(files);

const total = Object.values(problems).reduce((n, list) => n + list.length, 0);
const allowed = allowedMatches ? `, ${allowedMatches} match${allowedMatches === 1 ? '' : 'es'} allowed by check:allow` : '';
if (total === 0) {
  console.log(`check.mjs: ${files.length} files, no problems${allowed}.`);
  process.exit(0);
}

const annotate = process.env.GITHUB_ACTIONS === 'true';
console.log(`check.mjs: ${total} problem${total === 1 ? '' : 's'} in ${files.length} files${allowed}\n`);
for (const [kind, list] of Object.entries(problems)) {
  if (!list.length) continue;
  console.log(kind);
  for (const { file, line, col, message } of list) {
    console.log(`  ${file}${line ? `:${line}:${col}` : ''}  ${message}`);
    if (annotate) console.log(`::error file=${file}${line ? `,line=${line},col=${col}` : ''}::${kind}: ${message}`);
  }
  console.log('');
}
if (problems.safety.length) {
  console.log('Safety: remove the text. A false positive on email, indeck-id, cloud-host or money: add check:allow=<rule> to that line (<!-- check:allow=indeck-id --> in Markdown).');
  console.log('Something real already pushed: see CONTRIBUTING.md, "If something leaked".');
}
process.exit(1);
