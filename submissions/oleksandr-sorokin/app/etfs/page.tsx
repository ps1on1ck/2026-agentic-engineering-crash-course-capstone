import { list, DEFAULT_PAGE_SIZE } from '@/lib/etf-repository';
import EtfTable from '@/components/EtfTable';
import EtfPagination from '@/components/EtfPagination';
import EtfFilters from '@/components/EtfFilters';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function toArray(val: string | string[] | undefined): string[] | undefined {
  if (!val) return undefined;
  const arr = Array.isArray(val) ? val : [val];
  return arr.length > 0 ? arr : undefined;
}

export default async function EtfsPage({ searchParams }: Props) {
  const params = await searchParams;

  const page = Math.max(1, Number(params.page) || 1);
  const sortBy = typeof params.sortBy === 'string' ? params.sortBy : 'name';
  const sortDir = params.sortDir === 'desc' ? 'desc' : ('asc' as const);
  const rawMaxTer = typeof params.maxTer === 'string' ? parseFloat(params.maxTer) : undefined;
  const maxTer = Number.isFinite(rawMaxTer) ? rawMaxTer : undefined;

  const result = list({
    page,
    sortBy,
    sortDir,
    pageSize: DEFAULT_PAGE_SIZE,
    search: typeof params.search === 'string' ? params.search : undefined,
    assetClass: toArray(params.assetClass),
    region: toArray(params.region),
    issuer: toArray(params.issuer),
    distribution: toArray(params.distribution),
    maxTer,
  });

  return (
    <main className="flex-1 overflow-x-auto px-4 py-6">
      <EtfFilters />
      <EtfTable items={result.items} sortBy={sortBy} sortDir={sortDir} />
      <EtfPagination page={result.page} total={result.total} pageSize={DEFAULT_PAGE_SIZE} />
    </main>
  );
}
