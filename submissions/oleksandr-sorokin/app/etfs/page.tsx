import { list, DEFAULT_PAGE_SIZE } from '@/lib/etf-repository';
import EtfTable from '@/components/EtfTable';
import EtfPagination from '@/components/EtfPagination';

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EtfsPage({ searchParams }: Props) {
  const params = await searchParams;

  const page = Math.max(1, Number(params.page) || 1);
  const sortBy = typeof params.sortBy === 'string' ? params.sortBy : 'name';
  const sortDir = params.sortDir === 'desc' ? 'desc' : ('asc' as const);

  const hasFilters = Boolean(
    params.search || params.assetClass || params.region || params.issuer,
  );

  const result = list({ page, sortBy, sortDir, pageSize: DEFAULT_PAGE_SIZE });

  return (
    <main className="flex-1 overflow-x-auto px-4 py-6">
      <EtfTable
        items={result.items}
        sortBy={sortBy}
        sortDir={sortDir}
        hasFilters={hasFilters}
      />
      <EtfPagination
        page={result.page}
        total={result.total}
        pageSize={DEFAULT_PAGE_SIZE}
      />
    </main>
  );
}
