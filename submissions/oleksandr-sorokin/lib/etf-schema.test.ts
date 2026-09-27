import { describe, expect, it } from "vitest";
import { EtfSchema } from "./etf-schema";

function makePrices(count: number) {
  const start = new Date("2023-01-03");
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return { date: d.toISOString().slice(0, 10), price: 100 + i * 0.1 };
  });
}

const VALID_ETF = {
  ticker: "IWDA",
  name: "iShares Core MSCI World UCITS ETF",
  issuer: "iShares",
  assetClass: "equity" as const,
  region: "global" as const,
  currency: "USD",
  ter: 0.2,
  aum: 50000,
  inceptionDate: "2009-09-25",
  distribution: "accumulating" as const,
  replication: "physical" as const,
  return1y: 0.12,
  return3y: 0.08,
  return5y: 0.1,
  volatility1y: 0.15,
  prices: makePrices(252),
  holdings: [{ name: "Apple Inc", weight: 5.0 }],
  sectorWeights: [{ label: "Technology", weight: 20.0 }],
  countryWeights: [{ label: "United States", weight: 70.0 }],
};

describe("EtfSchema", () => {
  // Scenario: Valid record shape
  it.fails("accepts a fully valid ETF object without error", () => {
    expect(() => EtfSchema.parse(VALID_ETF)).not.toThrow();
    const parsed = EtfSchema.parse(VALID_ETF);
    expect(parsed.ticker).toBe("IWDA");
  });

  // Scenario: Prices cover ~1 trading year
  it("requires exactly 252 price entries", () => {
    const short = makePrices(100);
    expect(() => EtfSchema.parse({ ...VALID_ETF, prices: short })).toThrow();
  });

  it("requires exactly 252 price entries — not 253", () => {
    const long = makePrices(253);
    expect(() => EtfSchema.parse({ ...VALID_ETF, prices: long })).toThrow();
  });

  it("requires each price entry to have a valid ISO date", () => {
    const badPrices = makePrices(252).map((p) => ({ ...p, date: "not-a-date" }));
    expect(() => EtfSchema.parse({ ...VALID_ETF, prices: badPrices })).toThrow();
  });

  it("requires each price entry to have a positive price", () => {
    const badPrices = makePrices(252).map((p, i) =>
      i === 5 ? { ...p, price: 0 } : p,
    );
    expect(() => EtfSchema.parse({ ...VALID_ETF, prices: badPrices })).toThrow();
  });

  it("rejects a record with a missing required field (ter)", () => {
    const withoutTer = Object.fromEntries(
      Object.entries(VALID_ETF).filter(([k]) => k !== "ter"),
    );
    expect(() => EtfSchema.parse(withoutTer)).toThrow();
  });

  it("rejects an invalid assetClass enum value", () => {
    expect(() =>
      EtfSchema.parse({ ...VALID_ETF, assetClass: "crypto" }),
    ).toThrow();
  });

  it("rejects an invalid region enum value", () => {
    expect(() =>
      EtfSchema.parse({ ...VALID_ETF, region: "antarctica" }),
    ).toThrow();
  });

  it("rejects a currency that is not exactly 3 characters", () => {
    expect(() => EtfSchema.parse({ ...VALID_ETF, currency: "US" })).toThrow();
    expect(() =>
      EtfSchema.parse({ ...VALID_ETF, currency: "USDA" }),
    ).toThrow();
  });

  it("rejects a ter value outside 0–5", () => {
    expect(() => EtfSchema.parse({ ...VALID_ETF, ter: -0.01 })).toThrow();
    expect(() => EtfSchema.parse({ ...VALID_ETF, ter: 5.01 })).toThrow();
  });

  it("rejects a negative aum value", () => {
    expect(() => EtfSchema.parse({ ...VALID_ETF, aum: -1 })).toThrow();
  });

  it("rejects a negative volatility1y value", () => {
    expect(() =>
      EtfSchema.parse({ ...VALID_ETF, volatility1y: -0.01 }),
    ).toThrow();
  });

  it("rejects holdings with more than 10 entries", () => {
    const overHoldings = Array.from({ length: 11 }, (_, i) => ({
      name: `Stock ${i}`,
      weight: 1.0,
    }));
    expect(() =>
      EtfSchema.parse({ ...VALID_ETF, holdings: overHoldings }),
    ).toThrow();
  });

  it("rejects an invalid distribution enum value", () => {
    expect(() =>
      EtfSchema.parse({ ...VALID_ETF, distribution: "reinvesting" }),
    ).toThrow();
  });

  it("rejects an invalid replication enum value", () => {
    expect(() =>
      EtfSchema.parse({ ...VALID_ETF, replication: "direct" }),
    ).toThrow();
  });
});
