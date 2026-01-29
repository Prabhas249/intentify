"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface NewVsReturningChartProps {
  newCount: number;
  returningCount: number;
}

const COLORS = ["#3b82f6", "#22c55e"];

export function NewVsReturningChart({
  newCount,
  returningCount,
}: NewVsReturningChartProps) {
  const total = newCount + returningCount;
  const data = [
    { name: "New", value: newCount },
    { name: "Returning", value: returningCount },
  ];

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-[180px] text-muted-foreground text-sm">
        No visitor data yet
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={75}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [
              `${value.toLocaleString()} (${total > 0 ? ((value / total) * 100).toFixed(1) : 0}%)`,
              name,
            ]}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--background))",
              fontSize: "12px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-blue-500" />
          <span className="text-muted-foreground">New</span>
          <span className="font-semibold">{newCount.toLocaleString()}</span>
          <span className="text-muted-foreground text-xs">
            ({total > 0 ? ((newCount / total) * 100).toFixed(0) : 0}%)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-500" />
          <span className="text-muted-foreground">Returning</span>
          <span className="font-semibold">{returningCount.toLocaleString()}</span>
          <span className="text-muted-foreground text-xs">
            ({total > 0 ? ((returningCount / total) * 100).toFixed(0) : 0}%)
          </span>
        </div>
      </div>
    </div>
  );
}
