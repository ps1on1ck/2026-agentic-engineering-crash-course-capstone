import type { Holding } from "@/lib/etf-schema";

type Props = { holdings: Holding[] };

export default function HoldingsTable({ holdings }: Props) {
  return (
    <table>
      <thead>
        <tr>
          <th scope="col">#</th>
          <th scope="col">Name</th>
          <th scope="col">Weight</th>
        </tr>
      </thead>
      <tbody>
        {holdings.map((h, i) => (
          <tr key={h.name}>
            <td>{i + 1}</td>
            <td>{h.name}</td>
            <td>{h.weight.toFixed(2)}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
