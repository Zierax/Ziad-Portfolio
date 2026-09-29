/**
 * Guard: every `zyo-*` COLOUR utility used in src/ must resolve to a real token.
 *
 * Why this exists. Tailwind emits no CSS for a class whose colour key it does
 * not know, and a missing colour utility is not a type error, so `tsc` and
 * `vite build` both pass while a caret, a focus ring or a border silently
 * disappears at runtime. Two separate palette renames hit this exact failure,
 * so it is checked rather than remembered.
 *
 * Two distinct consumption paths, checked separately:
 *   1. Tailwind colour utilities  -> need BOTH a --zyo-* var and a `zyo.*`
 *      key in tailwind.config.ts. Matching is anchored on the utility prefix
 *      (text-, bg-, border-, outline-, ...) so animation names like
 *      `zyo-float` and the `zyo-dismissed` storage key are not mistaken for
 *      colours.
 *   2. `var(--zyo-*)` in inline SVG/CSS -> need the var only.
 *
 * Exits non-zero with every problem listed.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const SRC = join(ROOT, "src");

const COLOUR_UTILITIES =
  "(?:text|bg|border|outline|ring|from|to|via|decoration|divide|placeholder|caret|accent|fill|stroke|shadow)-";

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx|css)$/.test(entry)) out.push(full);
  }
  return out;
}

const css = readFileSync(join(SRC, "index.css"), "utf8");
const declared = new Set([...css.matchAll(/--zyo-([a-z]+)\s*:/g)].map((m) => m[1]));

const config = readFileSync(join(ROOT, "tailwind.config.ts"), "utf8");
const group = config.match(/zyo:\s*\{([^}]*)\}/);
const exposed = new Set(
  group ? [...group[1].matchAll(/([a-z]+):\s*"hsl\(var\(--zyo-[a-z]+\)\)"/g)].map((m) => m[1]) : []
);

const utilUse = new Map(); // colour -> Set(files)   via Tailwind utilities
const varUse = new Map(); // colour -> Set(files)   via var(--zyo-*)

for (const file of walk(SRC)) {
  const text = readFileSync(file, "utf8");
  const rel = relative(ROOT, file);
  const util = new RegExp(COLOUR_UTILITIES + "zyo-([a-z]+)", "g");
  for (const m of text.matchAll(util)) {
    if (!utilUse.has(m[1])) utilUse.set(m[1], new Set());
    utilUse.get(m[1]).add(rel);
  }
  for (const m of text.matchAll(/var\(--zyo-([a-z]+)\)/g)) {
    if (!varUse.has(m[1])) varUse.set(m[1], new Set());
    varUse.get(m[1]).add(rel);
  }
}

const problems = [];
const fmt = (s) => [...s].join(", ");

for (const [name, files] of [...utilUse].sort()) {
  const where = fmt(files);
  if (!declared.has(name)) {
    problems.push(`zyo-${name} used in ${where} but --zyo-${name} is not declared in src/index.css`);
  } else if (!exposed.has(name)) {
    problems.push(`zyo-${name} used in ${where} but "zyo.${name}" is missing from tailwind.config.ts, so no utility is generated`);
  }
}

for (const [name, files] of [...varUse].sort()) {
  if (!declared.has(name)) {
    problems.push(`var(--zyo-${name}) used in ${fmt(files)} but the variable is not declared in src/index.css`);
  }
}

const used = new Set([...utilUse.keys(), ...varUse.keys()]);
for (const name of [...declared].sort()) {
  if (!used.has(name)) problems.push(`--zyo-${name} is declared but never used (dead token)`);
}

if (problems.length > 0) {
  console.error("zyo token check FAILED\n");
  for (const p of problems) console.error(`  - ${p}`);
  console.error("");
  process.exit(1);
}

console.log(
  `zyo token check passed — ${used.size} colour${used.size === 1 ? "" : "s"} ` +
    `(${[...used].sort().map((n) => `zyo-${n}`).join(", ")}) all resolve.`
);
