#!/usr/bin/env node
/**
 * Traceability validator for Fix Frame Specification V2.
 *
 * Fails on:
 *   1. Dangling reference  - an ID cited anywhere that no definition source defines.
 *   2. Silent gap          - an empty cell in a requirement row of the matrix.
 *   3. Ungated unknown     - an UNRESOLVED entry missing an owner or a blocking gate.
 *
 * Rule 3 is what stops UNRESOLVED from decaying into the new [TBD].
 *
 * No dependencies. Run: node spec/tools/check-traceability.mjs
 */

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const SPEC = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warnings = [];

const readRaw = (p) => readFileSync(join(SPEC, p), 'utf8');
const read = (p) => stripIgnored(readRaw(p));
const listMd = (dir) =>
  existsSync(join(SPEC, dir))
    ? readdirSync(join(SPEC, dir)).filter((f) => f.endsWith('.md')).map((f) => join(dir, f))
    : [];

/** Strip markdown link targets so `[ADR-001](../decisions/ADR-001-database.md)` yields one token. */
const stripLinkTargets = (s) => s.replace(/\]\([^)]*\)/g, ']');

/**
 * Remove regions a document has explicitly excluded. Used where a file shows
 * ID *formats* rather than citing real IDs - the README's scheme table, for
 * instance. Deliberately narrow: an ignore block hides dangling references, so
 * it should cover illustrative text and nothing else.
 */
const stripIgnored = (s) =>
  s.replace(/<!--\s*traceability:ignore-start\s*-->[\s\S]*?<!--\s*traceability:ignore-end\s*-->/g, '');

const TOKEN = /\b(?:ENT|API|JOB|PERM|NTF|EVT|TC|REQ|RULE|AC|UNRESOLVED|ADR)-[A-Za-z0-9][A-Za-z0-9-]*/g;
const tokensIn = (text) => stripLinkTargets(text).match(TOKEN) ?? [];

/** First backticked cell of a markdown table row, e.g. | `API-lead-create` | ... */
const firstCellIds = (text, prefix) => {
  const out = new Set();
  const re = new RegExp(`^\\|\\s*\`(${prefix}-[A-Za-z0-9][A-Za-z0-9-]*)\``, 'gm');
  for (const m of text.matchAll(re)) out.add(m[1]);
  return out;
};

const allIds = (text, prefix) => {
  const out = new Set();
  const re = new RegExp(`\\b${prefix}-[A-Za-z0-9][A-Za-z0-9-]*`, 'g');
  for (const m of stripLinkTargets(text).matchAll(re)) out.add(m[0]);
  return out;
};

// ── Build the defined-ID universe ───────────────────────────────────────────
// Definitions are read from a *different* file than the matrix that references
// them, so a typo in the matrix cannot define itself.

const entitiesSrc = read('reference/entities.md');
const apiSrc = read('reference/api.md');
const permsSrc = read('reference/permissions.md');
const notifSrc = read('reference/notifications.md');
const eventsSrc = read('reference/events.md');
const screensSrc = read('reference/screens.md');

const partFiles = listMd('parts');
const partsSrc = partFiles.map(read).join('\n');
const testsSrc = read('parts/M-prime-test-cases.md');

const defined = {
  // Entity definitions: heading lines (### ENT-Foo, or ### ENT-Foo / ENT-Bar),
  // plus lines opening with a backticked entity - how the deferred finance
  // block is written. Both forms may declare several entities per line.
  ENT: new Set(
    entitiesSrc
      .split('\n')
      .filter((l) => /^#{2,4}\s+ENT-/.test(l) || /^`ENT-/.test(l))
      .flatMap((l) => l.match(/\bENT-[A-Za-z]+/g) ?? []),
  ),
  API: firstCellIds(apiSrc, 'API'),
  JOB: firstCellIds(apiSrc, 'JOB'),
  PERM: allIds(permsSrc, 'PERM'),
  NTF: firstCellIds(notifSrc, 'NTF'),
  EVT: allIds(eventsSrc, 'EVT'),
  TC: firstCellIds(testsSrc, 'TC'),
  REQ: firstCellIds(partsSrc, 'REQ'),
  // RULE and AC are declared inline throughout the parts in several shapes.
  // Definition scope is parts/ only - see "Known limitation" in the README.
  RULE: allIds(partsSrc, 'RULE'),
  AC: allIds(partsSrc, 'AC'),
  ADR: new Set(
    listMd('decisions').map((f) => (basename(f).match(/^(ADR-\d+)/) ?? [])[1]).filter(Boolean),
  ),
  UNRESOLVED: new Set(),
};

// Screens are matched separately - they are bare codes like C07, not prefixed.
const screens = new Set(
  [...screensSrc.matchAll(/^\|\s*`([A-Z]\d{2})`/gm)].map((m) => m[1]),
);

// ── Rule 3: every UNRESOLVED has an owner and a gate ────────────────────────

const unresolvedSrc = read('traceability/unresolved.md');
for (const line of unresolvedSrc.split('\n')) {
  const m = line.match(/^\|\s*`(UNRESOLVED-\d+)`\s*\|(.*)$/);
  if (!m) continue;
  const [, id, rest] = m;
  defined.UNRESOLVED.add(id);

  const cells = rest.split('|').map((c) => c.trim());
  const [question, owner, gate] = cells;

  if (!question) errors.push(`${id}: no question stated`);
  if (!owner) errors.push(`${id}: no owner - rule 3 (ungated unknown)`);
  if (!gate) errors.push(`${id}: no blocking gate - rule 3 (ungated unknown)`);
  else if (!/^`?G\d{2}`?$/.test(gate)) {
    errors.push(`${id}: gate "${gate}" is not a G01-G12 phase reference`);
  }
}

// ── Rule 1: no dangling references ──────────────────────────────────────────

const referencingFiles = [
  'traceability/matrix.md',
  'traceability/unresolved.md',
  'README.md',
  ...partFiles,
  ...listMd('reference'),
  ...listMd('decisions'),
];

for (const file of referencingFiles) {
  const text = read(file);
  for (const token of new Set(tokensIn(text))) {
    const prefix = token.split('-')[0];
    const universe = defined[prefix];
    if (!universe) continue;
    if (!universe.has(token)) {
      errors.push(`${file}: dangling reference "${token}" - no definition found`);
    }
  }
}

// ── Rules 1 + 2 on the matrix requirement rows ──────────────────────────────

const matrixSrc = read('traceability/matrix.md');
const CHAIN = ['Screen', 'Rule', 'Entity', 'API', 'Perm', 'Notification', 'State', 'Test', 'AC'];
let requirementRows = 0;

for (const [n, line] of matrixSrc.split('\n').entries()) {
  if (!/^\|\s*`REQ-/.test(line)) continue;
  requirementRows++;

  const cells = line.split('|').slice(1, -1).map((c) => c.trim());
  const req = (cells[0].match(/`(REQ-[A-Za-z0-9-]+)`/) ?? [])[1] ?? cells[0];

  if (cells.length !== 10) {
    errors.push(`matrix.md:${n + 1} ${req}: expected 10 columns, found ${cells.length}`);
    continue;
  }

  cells.slice(1).forEach((cell, i) => {
    if (cell === '') {
      errors.push(`matrix.md:${n + 1} ${req}: empty "${CHAIN[i]}" cell - rule 2 (silent gap). Use an ID, an em dash, or an UNRESOLVED reference.`);
    }
  });

  // Screen column holds bare codes.
  for (const code of (cells[1].match(/`([A-Z]\d{2})`/g) ?? [])) {
    const id = code.replace(/`/g, '');
    if (!screens.has(id)) {
      errors.push(`matrix.md:${n + 1} ${req}: unknown screen "${id}" - not in reference/screens.md`);
    }
  }
}

// ── Advisory: registered but never referenced ───────────────────────────────

const referencedEverywhere = new Set(
  referencingFiles.flatMap((f) => tokensIn(read(f))),
);
for (const id of defined.UNRESOLVED) {
  const uses = referencingFiles.filter((f) => f !== 'traceability/unresolved.md' && tokensIn(read(f)).includes(id));
  if (uses.length === 0) warnings.push(`${id}: registered but never referenced by a part or the matrix`);
}
for (const tc of defined.TC) {
  if (!referencedEverywhere.has(tc)) warnings.push(`${tc}: defined but not referenced by the matrix`);
}

// ── Report ──────────────────────────────────────────────────────────────────

const counts = Object.entries(defined)
  .map(([k, v]) => `${k} ${v.size}`)
  .concat(`SCREEN ${screens.size}`)
  .join(' · ');

console.log('Fix Frame · Specification V2 — traceability check\n');
console.log(`Definitions: ${counts}`);
console.log(`Matrix requirement rows: ${requirementRows}\n`);

if (warnings.length) {
  console.log(`Advisory (${warnings.length}):`);
  for (const w of warnings) console.log(`  ~ ${w}`);
  console.log('');
}

if (errors.length) {
  console.error(`FAIL — ${errors.length} error${errors.length === 1 ? '' : 's'}:\n`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  console.error('');
  process.exit(1);
}

console.log('PASS — no dangling references, no silent gaps, every UNRESOLVED owned and gated.');
