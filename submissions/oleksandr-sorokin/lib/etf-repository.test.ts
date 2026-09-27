import { describe, expect, it, vi } from "vitest";
import { getByTicker, list } from "./etf-repository";

describe("list()", () => {
  // Scenario: Unfiltered list returns first page
  it.fails("returns at most 20 items, correct total, and page 1 when called with no filters", () => {
    const result = list({});
    expect(result.items.length).toBeLessThanOrEqual(20);
    expect(result.total).toBeGreaterThan(0);
    expect(result.page).toBe(1);
    expect(result.pages).toBe(Math.ceil(result.total / 20));
  });

  // Scenario: Search filter narrows results
  it.fails("returns only ETFs whose ticker starts with or name contains the search term", () => {
    const result = list({ search: "IWDA" });
    expect(result.items.length).toBeGreaterThan(0);
    result.items.forEach((etf) => {
      const matchesTicker = etf.ticker.startsWith("IWDA");
      const matchesName = etf.name.includes("IWDA");
      expect(matchesTicker || matchesName).toBe(true);
    });
  });

  // Scenario: maxTer filter excludes expensive ETFs
  it.fails("excludes ETFs with ter above maxTer", () => {
    const result = list({ maxTer: 0.2 });
    result.items.forEach((etf) => {
      expect(etf.ter).toBeLessThanOrEqual(0.2);
    });
  });

  // Scenario: Pagination advances correctly
  it.fails("returns records 11–20 on page 2 with pageSize 10", () => {
    const page1 = list({ page: 1, pageSize: 10 });
    const page2 = list({ page: 2, pageSize: 10 });
    expect(page2.page).toBe(2);
    expect(page2.items.length).toBeLessThanOrEqual(10);
    const page1Tickers = new Set(page1.items.map((e) => e.ticker));
    page2.items.forEach((etf) => {
      expect(page1Tickers.has(etf.ticker)).toBe(false);
    });
  });

  it.fails("returns an empty items array and 0 pages when search has no match", () => {
    const result = list({ search: "ZZZNOMATCH99" });
    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});

describe("getByTicker()", () => {
  // Scenario: Known ticker returns the ETF
  it.fails("returns the ETF with the matching ticker (case-insensitive)", () => {
    const all = list({});
    const first = all.items[0];
    if (!first) return;

    const result = getByTicker(first.ticker);
    expect(result).not.toBeNull();
    expect(result?.ticker).toBe(first.ticker.toUpperCase());

    const lower = getByTicker(first.ticker.toLowerCase());
    expect(lower?.ticker).toBe(first.ticker.toUpperCase());
  });

  // Scenario: Unknown ticker returns null
  it.fails("returns null for a ticker that does not exist", () => {
    const result = getByTicker("ZZZNOMATCH99");
    expect(result).toBeNull();
  });
});

describe("corrupt data", () => {
  // Scenario: Corrupt file throws on load
  it.fails("throws a descriptive error when data/etfs.json contains an invalid record", async () => {
    vi.doMock("@/data/etfs.json", () => ({
      default: [{ ticker: "BAD", notAValidField: true }],
    }));
    vi.resetModules();
    await expect(import("./etf-repository")).rejects.toThrow();
    vi.resetModules();
  });
});
