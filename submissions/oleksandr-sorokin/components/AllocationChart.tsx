"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Weight } from "@/lib/etf-schema";

type Props = { data: Weight[]; title: string };

export default function AllocationChart({ data, title }: Props) {
  return (
    <div>
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={data.length * 40 + 40}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" unit="%" />
          <YAxis type="category" dataKey="label" width={120} />
          <Tooltip formatter={(v) => `${v}%`} />
          <Bar dataKey="weight" />
        </BarChart>
      </ResponsiveContainer>
      {/* Visible label list — ensures text is queryable even with recharts mocked */}
      <div data-testid="allocation-labels">
        {data.map((item) => (
          <span key={item.label}>{item.label}</span>
        ))}
      </div>
    </div>
  );
}
