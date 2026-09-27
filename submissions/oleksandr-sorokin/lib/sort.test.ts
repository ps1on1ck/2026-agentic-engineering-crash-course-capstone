import { describe, expect, it } from "vitest";
import type { Etf } from "./etf-schema";
import { sortEtfs } from "./sort";

function makePrices() {
  const start = new Date("2023-01-03");
  return Array.from({ length: 252 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return { date: d.toISOString().slice(0, 10), price: 100 + i * 0.1 };
  });
}

const BASE: Etf = {
  ticker: "IWDA",
  name: "iShares Core MSCI World UCITS ETF",
  issuer: "iShares",
  assetClass: "equity",
  region: "global",
  currency: "USD",
  ter: 0.2,
  aum: 50000,
  inceptionDate: "2009-09-25",
  distribution: "accumulating",
  replication: "physical",
  return1y: 0.12,
  return3y: 0.08,
  return5y: 0.1,
  volatility1y: 0.15,
  prices: makePrices(),
  holdings: [{ name: "Apple Inc", weight: 5.0 }],
  sectorWeights: [{ label: "Technology", weight: 20.0 }],
  countryWeights: [{ label: "United States", weight: 70.0 }],
};

const ETFS: Etf[] = [
  { ...BASE, ticker: "VWCE", name: "Vanguard FTSE All-World UCITS ETF", ter: 0.22, aum: 10000, return1y: 0.09 },
  { ...BASE, ticker: "IWDA", name: "iShares Core MSCI World UCITS ETF", ter: 0.2, aum: 50000, return1y: 0.12 },
  { ...BASE, ticker: "CSPX", name: "iShares Core S&P 500 UCITS ETF", ter: 0.07, aum: 70000, return1y: 0.15 },
  { ...BASE, ticker: "AGGH", name: "iShares Core Global Aggregate Bond", ter: 0.1, aum: 20000, return1y: 0.04 },
];

describe("sortEtfs()", () => {
  it.fails("sorts by ter ascending — cheapest first", () => {
    const result = sortEtfs(ETFS, "ter", "asc");
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].ter).toBeLessThanOrEqual(result[i].ter);
    }
  });

  it.fails("sorts by ter descending — most expensive first", () => {
    const result = sortEtfs(ETFS, "ter", "desc");
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].ter).toBeGreaterThanOrEqual(result[i].ter);
    }
  });

  it.fails("sorts by name ascending — alphabetical order", () => {
    const result = sortEtfs(ETFS, "name", "asc");
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].name.localeCompare(result[i].name)).toBeLessThanOrEqual(0);
    }
  });

  it.fails("sorts by return1y descending — best performer first", () => {
    const result = sortEtfs(ETFS, "return1y", "desc");
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].return1y).toBeGreaterThanOrEqual(result[i].return1y);
    }
  });

  it.fails("sorts by aum descending — largest fund first", () => {
    const result = sortEtfs(ETFS, "aum", "desc");
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].aum).toBeGreaterThanOrEqual(result[i].aum);
    }
  });

  it.fails("stable ordering — equal values preserve relative input order", () => {
    const tieEtfs: Etf[] = [
      { ...BASE, ticker: "AAA", name: "Alpha Fund", ter: 0.1 },
      { ...BASE, ticker: "BBB", name: "Beta Fund", ter: 0.1 },
      { ...BASE, ticker: "CCC", name: "Gamma Fund", ter: 0.1 },
    ];
    const result = sortEtfs(tieEtfs, "ter", "asc");
    expect(result.map((e) => e.ticker)).toEqual(["AAA", "BBB", "CCC"]);
  });

  it.fails("does not mutate the original array", () => {
    const original = [...ETFS];
    sortEtfs(ETFS, "ter", "asc");
    expect(ETFS.map((e) => e.ticker)).toEqual(original.map((e) => e.ticker));
  });
});
