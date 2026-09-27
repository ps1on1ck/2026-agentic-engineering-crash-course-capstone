'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Etf } from '@/lib/etf-schema';
import { formatPercent } from '@/lib/format-percent';
import { formatAum } from '@/lib/format-aum';

type SortDir = 'asc' | 'desc';

type Column = {
  header: string;
  key: string;
  render: (etf: Etf) => string;
};

const COLUMNS: Column[] = [
  { header: 'Ticker',      key: 'ticker',      render: (e) => e.ticker },
  { header: 'Name',        key: 'name',        render: (e) => e.name },
  { header: 'Issuer',      key: 'issuer',      render: (e) => e.issuer },
  { header: 'Asset Class', key: 'assetClass',  render: (e) => e.assetClass },
  { header: 'Region',      key: 'region',      render: (e) => e.region },
  { header: 'TER %',       key: 'ter',         render: (e) => formatPercent(e.ter) },
  { header: 'AUM',         key: 'aum',         render: (e) => formatAum(e.aum) },
  { header: '1Y Return',   key: 'return1y',    render: (e) => formatPercent(e.return1y) },
];

const FILTER_PARAM_KEYS = ['search', 'assetClass', 'region', 'issuer', 'distribution', 'maxTer'];

type Props = {
  items: Etf[];
  sortBy: string;
  sortDir: SortDir;
};

export default function EtfTable({ items, sortBy, sortDir }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasFilters = FILTER_PARAM_KEYS.some((k) => searchParams.has(k));

  function handleSort(key: string) {
    const newDir: SortDir =
      key === sortBy && sortDir === 'asc' ? 'desc' : 'asc';
    const params = new URLSearchParams(searchParams.toString());
    params.set('sortBy', key);
    params.set('sortDir', newDir);
    params.delete('page');
    router.push(`/etfs?${params}`);
  }

  function handleClearFilters() {
    router.replace('/etfs');
  }

  if (items.length === 0) {
    return (
      <div>
        <p>{hasFilters ? 'No ETFs match your filters.' : 'No ETF data available.'}</p>
        {hasFilters && (
          <button type="button" onClick={handleClearFilters}>
            Clear filters
          </button>
        )}
      </div>
    );
  }

  return (
    <table>
      <thead>
        <tr>
          {COLUMNS.map((col) => {
            const isActive = col.key === sortBy;
            const ariaSort = isActive
              ? sortDir === 'asc'
                ? 'ascending'
                : 'descending'
              : undefined;
            return (
              <th key={col.key} aria-sort={ariaSort}>
                <button type="button" onClick={() => handleSort(col.key)}>
                  {col.header}
                </button>
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {items.map((etf) => (
          <tr key={etf.ticker}>
            {COLUMNS.map((col) => (
              <td key={col.key}>
                <Link href={`/etfs/${etf.ticker}`}>{col.render(etf)}</Link>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
