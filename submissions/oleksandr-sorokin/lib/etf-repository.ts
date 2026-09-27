// Stub — implementation in task 3.2 (openspec/changes/01-etf-data/)
import type { Etf } from "./etf-schema";

export type ListQuery = {
  search?: string;
  assetClass?: string[];
  region?: string[];
  issuer?: string[];
  distribution?: string[];
  maxTer?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

export type ListResult = {
  items: Etf[];
  total: number;
  page: number;
  pages: number;
};

const _notImplemented = (): never => {
  throw new Error(
    "lib/etf-repository.ts is not implemented — see openspec/changes/01-etf-data/ task 3.2",
  );
};

export function list(_query: ListQuery): ListResult {
  return _notImplemented();
}

export function getByTicker(_ticker: string): Etf | null {
  return _notImplemented();
}
