import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "..");
const SCRIPT = join(ROOT, "scripts", "generate-seed.mjs");
const DATA_FILE = join(ROOT, "data", "etfs.json");

afterEach(() => {
  if (existsSync(DATA_FILE)) {
    rmSync(DATA_FILE);
  }
});

function runGenerator() {
  execFileSync("node", [SCRIPT], { cwd: ROOT, stdio: "pipe" });
}

describe("generate-seed", () => {
  // Scenario: Deterministic output
  it.fails("produces byte-for-byte identical data/etfs.json on two consecutive runs", () => {
    runGenerator();
    const first = readFileSync(DATA_FILE, "utf-8");

    runGenerator();
    const second = readFileSync(DATA_FILE, "utf-8");

    expect(first).toBe(second);
  });

  // Scenario: No network calls — the script must complete and produce valid JSON
  it.fails("produces valid JSON output without requiring network access", () => {
    runGenerator();
    const content = readFileSync(DATA_FILE, "utf-8");
    const parsed = JSON.parse(content);

    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBeGreaterThanOrEqual(35);
    expect(parsed.length).toBeLessThanOrEqual(50);
  });

  it.fails("generates approximately 40 ETF records", () => {
    runGenerator();
    const parsed = JSON.parse(readFileSync(DATA_FILE, "utf-8")) as unknown[];
    expect(parsed.length).toBeGreaterThanOrEqual(35);
    expect(parsed.length).toBeLessThanOrEqual(45);
  });
});
