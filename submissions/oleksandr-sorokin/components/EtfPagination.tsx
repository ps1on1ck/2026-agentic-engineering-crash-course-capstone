'use client';

import { useRouter, useSearchParams } from 'next/navigation';

type Props = {
  page: number;
  total: number;
  pageSize: number;
};

export default function EtfPagination({ page, total, pageSize }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (total === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const totalPages = Math.ceil(total / pageSize);

  function goTo(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    router.push(`/etfs?${params}`);
  }

  return (
    <div>
      <p>Showing {start}–{end} of {total}</p>
      <p>Page {page} of {totalPages}</p>
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => goTo(page - 1)}
      >
        Previous
      </button>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => goTo(page + 1)}
      >
        Next
      </button>
    </div>
  );
}
