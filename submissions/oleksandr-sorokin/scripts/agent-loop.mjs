#!/usr/bin/env node
// One iteration of the "run to green" loop (trust level 3).
//
// Each call runs `pnpm check` once, increments a per-branch counter, and writes
// an evidence file to docs/evidence/loop/. Exit codes tell the calling agent
// what to do next:
//   0  — check passed (green). Stop the loop, you're done.
//   1  — check failed, iterations remaining. Fix the error and call again.
//   2  — check failed, iteration limit reached. Stop and report to the human.
//
// State is kept in .agent-log/loop-state.json (auto-reset when the branch changes).
// Usage:
//   node scripts/agent-loop.mjs [--max N]     (default: 5)
//   pnpm agent:loop
import { execSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const maxArg = process.argv.indexOf("--max");
const MAX = maxArg !== -1 ? parseInt(process.argv[maxArg + 1], 10) || 5 : 5;

const branch = (() => {
  try { return execSync("git branch --show-current", { cwd: root, encoding: "utf8" }).trim(); }
  catch { return "unknown"; }
})();
const sha = (() => {
  try { return execSync("git rev-parse --short HEAD", { cwd: root, encoding: "utf8" }).trim(); }
  catch { return "unknown"; }
})();

const stateDir = join(root, ".agent-log");
const stateFile = join(stateDir, "loop-state.json");
mkdirSync(stateDir, { recursive: true });

let state = { branch: "", iterations: 0, startedAt: "" };
if (existsSync(stateFile)) {
  try { state = JSON.parse(readFileSync(stateFile, "utf8")); } catch { /* reset */ }
}
if (state.branch !== branch) {
  state = { branch, iterations: 0, startedAt: new Date().toISOString() };
}
state.iterations += 1;
const iteration = state.iterations;
writeFileSync(stateFile, JSON.stringify(state, null, 2));

console.log(`\n─── agent:loop  iteration ${iteration}/${MAX}  branch=${branch}  sha=${sha} ───\n`);

const start = Date.now();
const result = spawnSync("pnpm", ["check"], {
  cwd: root,
  env: { ...process.env, FORCE_COLOR: "0" },
  encoding: "utf8",
  maxBuffer: 10 * 1024 * 1024,
  stdio: ["ignore", "pipe", "pipe"],
});
const elapsed = ((Date.now() - start) / 1000).toFixed(1);
const combined = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
const green = result.status === 0;

const status = green ? "PASS" : "FAIL";
console.log(combined || "(no output)");
console.log(`\n─── ${status}  ${elapsed}s  iteration ${iteration}/${MAX} ───\n`);

// Write evidence
const evidenceDir = join(root, "docs", "evidence", "loop");
mkdirSync(evidenceDir, { recursive: true });
const date = new Date().toISOString().slice(0, 10);
const evidenceFile = join(evidenceDir, `${date}-${sha}-iter${iteration}.md`);
const lines = [
  `# Agent Loop Evidence`,
  ``,
  `Date: ${new Date().toISOString()}`,
  `Branch: ${branch}`,
  `SHA: \`${sha}\``,
  `Iteration: ${iteration}/${MAX}`,
  `Result: ${status}`,
  `Duration: ${elapsed}s`,
  ``,
  `## pnpm check output`,
  ``,
  "```",
  combined || "(no output)",
  "```",
];
writeFileSync(evidenceFile, lines.join("\n") + "\n");
console.log(`Evidence: ${evidenceFile}`);

if (green) {
  // Reset iteration counter for next feature
  state.iterations = 0;
  writeFileSync(stateFile, JSON.stringify(state, null, 2));
  process.exit(0);
}

if (iteration >= MAX) {
  console.error(`\n✗ Iteration limit (${MAX}) reached. Stop and report to the human.\n`);
  process.exit(2);
}

const remaining = MAX - iteration;
console.error(`\n✗ Check failed. ${remaining} iteration(s) remaining — fix the error and run again.\n`);
process.exit(1);
