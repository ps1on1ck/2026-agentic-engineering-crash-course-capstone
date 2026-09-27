import { describe, expect, it } from "vitest";
import type { Etf } from "./etf-schema";
import { filterEtfs } from "./filter";

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
  { ...BASE, ticker: "IWDA", name: "iShares Core MSCI World UCITS ETF", assetClass: "equity", region: "global", issuer: "iShares", distribution: "accumulating", ter: 0.2 },
  { ...BASE, ticker: "CSPX", name: "iShares Core S&P 500 UCITS ETF", assetClass: "equity", region: "north-america", issuer: "iShares", distribution: "accumulating", ter: 0.07 },
  { ...BASE, ticker: "VWCE", name: "Vanguard FTSE All-World UCITS ETF", assetClass: "equity", region: "global", issuer: "Vanguard", distribution: "accumulating", ter: 0.22 },
  { ...BASE, ticker: "AGGH", name: "iShares Core Global Aggregate Bond UCITS ETF", assetClass: "bond", region: "global", issuer: "iShares", distribution: "distributing", ter: 0.1 },
  { ...BASE, ticker: "XMWO", name: "Xtrackers MSCI World Swap UCITS ETF", assetClass: "equity", region: "global", issuer: "Xtrackers", distribution: "accumulating", ter: 0.15, replication: "synthetic" },
];

describe("filterEtfs()", () => {
  it.fails("no-op query returns all ETFs unchanged", () => {
    const result = filterEtfs(ETFS, {});
    expect(result).toHaveLength(ETFS.length);
  });

  it.fails("search by ticker prefix returns matching ETFs", () => {
    const result = filterEtfs(ETFS, { search: "IW" });
    expect(result.map((e) => e.ticker)).toContain("IWDA");
    result.forEach((e) => {
      expect(e.ticker.startsWith("IW") || e.name.toLowerCase().includes("iw")).toBe(true);
    });
  });

  it.fails("search by name substring returns matching ETFs", () => {
    const result = filterEtfs(ETFS, { search: "Vanguard" });
    expect(result.map((e) => e.ticker)).toContain("VWCE");
    result.forEach((e) => {
      expect(e.ticker.includes("Vanguard") || e.name.includes("Vanguard")).toBe(true);
    });
  });

  it.fails("assetClass filter keeps only matching ETFs", () => {
    const result = filterEtfs(ETFS, { assetClass: ["bond"] });
    expect(result.map((e) => e.ticker)).toContain("AGGH");
    result.forEach((e) => expect(e.assetClass).toBe("bond"));
  });

  it.fails("region filter keeps only matching ETFs", () => {
    const result = filterEtfs(ETFS, { region: ["north-america"] });
    result.forEach((e) => expect(e.region).toBe("north-america"));
  });

  it.fails("issuer filter keeps only matching ETFs", () => {
    const result = filterEtfs(ETFS, { issuer: ["Vanguard"] });
    expect(result).toHaveLength(1);
    expect(result[0].ticker).toBe("VWCE");
  });

  it.fails("distribution filter keeps only accumulating ETFs", () => {
    const result = filterEtfs(ETFS, { distribution: ["accumulating"] });
    result.forEach((e) => expect(e.distribution).toBe("accumulating"));
  });

  it.fails("maxTer boundary excludes ETFs above the threshold", () => {
    const result = filterEtfs(ETFS, { maxTer: 0.2 });
    result.forEach((e) => expect(e.ter).toBeLessThanOrEqual(0.2));
  });

  it.fails("maxTer boundary includes ETFs exactly at the threshold", () => {
    const result = filterEtfs(ETFS, { maxTer: 0.2 });
    const tickers = result.map((e) => e.ticker);
    expect(tickers).toContain("IWDA"); // ter === 0.2 must be included
    expect(tickers).not.toContain("VWCE"); // ter === 0.22 must be excluded
  });

  it.fails("multiple filters are combined (AND logic)", () => {
    const result = filterEtfs(ETFS, {
      assetClass: ["equity"],
      issuer: ["iShares"],
    });
    result.forEach((e) => {
      expect(e.assetClass).toBe("equity");
      expect(e.issuer).toBe("iShares");
    });
  });

  it.fails("returns empty array when no ETFs match", () => {
    const result = filterEtfs(ETFS, { search: "ZZZNOMATCH99" });
    expect(result).toHaveLength(0);
  });
});
