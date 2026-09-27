'use client';

import { useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const ASSET_CLASSES = ['equity', 'bond', 'commodity', 'real-estate', 'multi-asset'];
const REGIONS = ['europe', 'north-america', 'global', 'asia-pacific', 'emerging-markets'];
const ISSUERS = ['Amundi', 'iShares', 'SPDR', 'Vanguard', 'Xtrackers'];
const DISTRIBUTIONS = ['accumulating', 'distributing'];

const FILTER_PARAMS = ['search', 'assetClass', 'region', 'issuer', 'distribution', 'maxTer'];

export default function EtfFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchRef = useRef<HTMLInputElement>(null);
  const maxTerRef = useRef<HTMLInputElement>(null);

  function pushParams(updates: Record<string, string | string[] | null>) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');
    for (const [key, value] of Object.entries(updates)) {
      if (value === null) {
        params.delete(key);
      } else if (Array.isArray(value)) {
        params.delete(key);
        for (const v of value) params.append(key, v);
      } else {
        params.set(key, value);
      }
    }
    router.push(`/etfs?${params}`);
  }

  function handleSearchCommit() {
    const term = searchRef.current?.value.trim() ?? '';
    pushParams({ search: term || null });
  }

  function handleMulti(param: string, value: string, checked: boolean) {
    const current = searchParams.getAll(param);
    const next = checked ? [...current, value] : current.filter((v) => v !== value);
    pushParams({ [param]: next.length > 0 ? next : null });
  }

  function handleMaxTerCommit() {
    const value = maxTerRef.current?.value.trim() ?? '';
    pushParams({ maxTer: value || null });
  }

  function handleReset() {
    const params = new URLSearchParams(searchParams.toString());
    for (const key of FILTER_PARAMS) params.delete(key);
    router.push(`/etfs?${params}`);
  }

  function isSelected(param: string, value: string) {
    return searchParams.getAll(param).includes(value);
  }

  return (
    <aside>
      <div>
        <label htmlFor="etf-search">Search</label>
        <input
          id="etf-search"
          type="text"
          ref={searchRef}
          defaultValue={searchParams.get('search') ?? ''}
          onBlur={handleSearchCommit}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSearchCommit(); }}
        />
      </div>

      <fieldset>
        <legend>Asset Class</legend>
        {ASSET_CLASSES.map((v) => (
          <label key={v}>
            <input
              type="checkbox"
              checked={isSelected('assetClass', v)}
              onChange={(e) => handleMulti('assetClass', v, e.target.checked)}
            />
            {v}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>Region</legend>
        {REGIONS.map((v) => (
          <label key={v}>
            <input
              type="checkbox"
              checked={isSelected('region', v)}
              onChange={(e) => handleMulti('region', v, e.target.checked)}
            />
            {v}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>Issuer</legend>
        {ISSUERS.map((v) => (
          <label key={v}>
            <input
              type="checkbox"
              checked={isSelected('issuer', v)}
              onChange={(e) => handleMulti('issuer', v, e.target.checked)}
            />
            {v}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>Distribution</legend>
        {DISTRIBUTIONS.map((v) => (
          <label key={v}>
            <input
              type="checkbox"
              checked={isSelected('distribution', v)}
              onChange={(e) => handleMulti('distribution', v, e.target.checked)}
            />
            {v}
          </label>
        ))}
      </fieldset>

      <div>
        <label htmlFor="etf-max-ter">Max TER (%)</label>
        <input
          id="etf-max-ter"
          type="number"
          min="0"
          max="5"
          step="0.01"
          ref={maxTerRef}
          defaultValue={searchParams.get('maxTer') ?? ''}
          onBlur={handleMaxTerCommit}
        />
      </div>

      <button type="button" onClick={handleReset}>
        Reset filters
      </button>
    </aside>
  );
}
