import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getByTicker } from "@/lib/etf-repository";
import { formatPercent } from "@/lib/format-percent";
import { formatAum } from "@/lib/format-aum";
import { formatDate } from "@/lib/format-date";
import { formatReturn } from "@/lib/format-return";
import PriceChart from "@/components/PriceChart";
import HoldingsTable from "@/components/HoldingsTable";
import AllocationChart from "@/components/AllocationChart";

type Props = {
  params: Promise<{ ticker: string }>;
  searchParams: Promise<Record<string, string>>;
};

export default async function EtfDetailsPage({ params, searchParams }: Props) {
  const { ticker } = await params;
  const { ref } = await searchParams;

  const etf = getByTicker(ticker);
  if (!etf) return notFound();

  const decoded = ref ? decodeURIComponent(ref) : "/etfs";
  const backHref = decoded.startsWith("/") ? decoded : "/etfs";

  return (
    <main>
      <nav>
        <Link href={backHref}>Back to list</Link>
      </nav>

      <header>
        <h1>
          {etf.name} ({etf.ticker})
        </h1>
        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-sm font-medium text-gray-700">{etf.issuer}</span>
        <p>{etf.assetClass}</p>
        <p>{etf.region}</p>
        <p>{etf.distribution}</p>
      </header>

      <section aria-label="Key metrics">
        <dl>
          <div>
            <dt>TER</dt>
            <dd>{formatPercent(etf.ter)}</dd>
          </div>
          <div>
            <dt>AUM</dt>
            <dd>{formatAum(etf.aum)}</dd>
          </div>
          <div>
            <dt>1Y Return</dt>
            <dd className={etf.return1y >= 0 ? "positive" : "negative"}>
              {formatReturn(etf.return1y)}
            </dd>
          </div>
          <div>
            <dt>3Y Return</dt>
            <dd className={etf.return3y >= 0 ? "positive" : "negative"}>
              {formatReturn(etf.return3y)}
            </dd>
          </div>
          <div>
            <dt>5Y Return</dt>
            <dd className={etf.return5y >= 0 ? "positive" : "negative"}>
              {formatReturn(etf.return5y)}
            </dd>
          </div>
          <div>
            <dt>1Y Volatility</dt>
            <dd>{formatPercent(etf.volatility1y)}</dd>
          </div>
          <div>
            <dt>Inception Date</dt>
            <dd>{formatDate(etf.inceptionDate)}</dd>
          </div>
        </dl>
      </section>

      {etf.prices.length > 0 && (
        <section aria-label="Price history">
          <Suspense>
            <PriceChart prices={etf.prices} ticker={etf.ticker} />
          </Suspense>
        </section>
      )}

      {etf.holdings.length > 0 && (
        <section aria-label="Top holdings">
          <HoldingsTable holdings={etf.holdings} />
        </section>
      )}

      {etf.sectorWeights.length > 0 && (
        <section aria-label="Sector allocation">
          <AllocationChart data={etf.sectorWeights} title="Sector Allocation" />
        </section>
      )}

      {etf.countryWeights.length > 0 && (
        <section aria-label="Country allocation">
          <AllocationChart data={etf.countryWeights} title="Country Allocation" />
        </section>
      )}
    </main>
  );
}
