import Link from "next/link";

export default function EtfNotFound() {
  return (
    <main>
      <h1>ETF not found</h1>
      <p>The ETF you are looking for does not exist.</p>
      <Link href="/etfs">Back to list</Link>
    </main>
  );
}
