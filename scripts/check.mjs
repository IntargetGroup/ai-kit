#!/usr/bin/env node
// Repository checks for ai-kit. Every check is exact, so a failure is always a real problem:
//   - size budgets (lines per page, characters of the pasteable instruction blocks);
//   - intentional copies stay identical (org instructions in claudeMd, folder template, setup prompt);
//   - links to files in this repository resolve, with exact case.
// No pattern matching on content: examples and fake data never trip it.
//
//   node scripts/check.mjs        Node >= 22, no dependencies, exit 1 on any problem.

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
  // Agent-facing specs: Claude reads them on demand, not every session. About 15% headroom, so growth is a reviewed change.
  'secondo-cervello/obsidian/SPEC.md': { lines: 650 },
  'engineering/knowledge-management-spec.md': { lines: 500 },
  // One page so its anti-pattern index covers every pattern.
  'engineering/patterns.md': { lines: 520 },
};
const DEFAULT_MD_LINES = 250;
const UNBUDGETED = new Set(['CHANGELOG.md']);
const BEGIN = '<!-- begin -->';
const END = '<!-- end -->';

/** Intentional copies: [source, copy, what, the part that must be identical]. checkSync also checks the org copy. */
const TEXT_FENCE = /^```text\n([\s\S]*?)^```$/m;
const COPIES = [
  ['inizia/modelli/CLAUDE-cartella.md', 'kit/primo-workspace/CLAUDE.md', 'file', (text) => text],
  ['inizia/prompt-di-setup.md', 'kit/primo-workspace/LEGGIMI.md', 'setup prompt block', (text) => text.match(TEXT_FENCE)?.[1]],
];

/** Absolute links to this repository's main branch; check.mjs resolves them against the tree. */
const SELF_URL = /https:\/\/(?:github\.com\/IntargetGroup\/ai-kit\/(?:blob|tree)\/main|raw\.githubusercontent\.com\/IntargetGroup\/ai-kit\/main)(?:\/([^\s)>\]"'`«»<]*))?/g;

const problems = { budgets: [], sync: [], links: [] };
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
      files.push({ path, text: null }); // binary: no text to check
      continue;
    }
    files.push({ path, text: buf.toString('utf8').replace(/\r\n/g, '\n') });
  }
  return files;
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
checkLinks(files);

const total = Object.values(problems).reduce((n, list) => n + list.length, 0);
if (total === 0) {
  console.log(`check.mjs: ${files.length} files, no problems.`);
  process.exit(0);
}

const annotate = process.env.GITHUB_ACTIONS === 'true';
console.log(`check.mjs: ${total} problem${total === 1 ? '' : 's'} in ${files.length} files\n`);
for (const [kind, list] of Object.entries(problems)) {
  if (!list.length) continue;
  console.log(kind);
  for (const { file, line, col, message } of list) {
    console.log(`  ${file}${line ? `:${line}:${col}` : ''}  ${message}`);
    if (annotate) console.log(`::error file=${file}${line ? `,line=${line},col=${col}` : ''}::${kind}: ${message}`);
  }
  console.log('');
}
process.exit(1);
