"use client";

import { BlurFade } from "@/components/landing/ui/blur-fade";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { CornerPlus } from "@/components/landing/ui/corner-plus";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ChartDataPoint {
  name: string;
  visitors: number;
  impressions: number;
  conversions: number;
}

interface PerformanceChartProps {
  hasData: boolean;
  chartData: ChartDataPoint[];
  conversionRate: string;
}

export function PerformanceChart({ hasData, chartData, conversionRate }: PerformanceChartProps) {
  const totalVisitors = chartData.reduce((acc, d) => acc + d.visitors, 0);
  const totalConversions = chartData.reduce((acc, d) => acc + d.conversions, 0);

  // Calculate trend by comparing first half to second half of period
  const midPoint = Math.floor(chartData.length / 2);
  const firstHalfConversions = chartData.slice(0, midPoint).reduce((acc, d) => acc + d.conversions, 0);
  const secondHalfConversions = chartData.slice(midPoint).reduce((acc, d) => acc + d.conversions, 0);
  const trend = firstHalfConversions > 0
    ? ((secondHalfConversions - firstHalfConversions) / firstHalfConversions * 100)
    : secondHalfConversions > 0 ? 100 : 0;

  const hasChartData = chartData.some(d => d.visitors > 0 || d.impressions > 0 || d.conversions > 0);

  return (
    <BlurFade delay={0.35} direction="up">
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-[0px_0px_0px_1px_rgba(0,0,0,0.04),0px_8px_12px_-4px_rgba(15,12,12,0.08),0px_1px_2px_0px_rgba(15,12,12,0.10)]">
        <CornerPlus position="top-left" className="text-border/50" />
        <CornerPlus position="top-right" className="text-border/50" />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-sky-500/5" />

        <div className="relative p-6">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-6">
            <div>
              <h2 className="text-xl font-medium tracking-tight">Performance Overview</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Visitor and conversion trends
              </p>
            </div>

            {hasData && hasChartData && (
              <div className="flex gap-6">
                <div className="text-right">
                  <p className="text-2xl font-medium tracking-tighter">{totalVisitors.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Visitors</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <p className="text-2xl font-medium tracking-tighter">{conversionRate}%</p>
                    {trend > 0 ? (
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                    ) : trend < 0 ? (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    ) : (
                      <Minus className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Conversion Rate</p>
                </div>
              </div>
            )}
          </div>

          {/* Chart */}
          {hasData && hasChartData ? (
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="currentColor"
                    className="text-border/30"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="currentColor"
                    className="text-muted-foreground"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="currentColor"
                    className="text-muted-foreground"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    labelStyle={{
                      color: "hsl(var(--foreground))",
                      fontWeight: 500,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="visitors"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorVisitors)"
                    name="Visitors"
                  />
                  <Area
                    type="monotone"
                    dataKey="conversions"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorConversions)"
                    name="Conversions"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[250px] text-center">
              {/* Decorative chart lines in background */}
              <div className="absolute inset-x-6 bottom-20 top-20 opacity-20">
                <div className="h-full w-full flex items-end gap-2 px-8">
                  {[40, 65, 45, 80, 55, 70, 50].map((height, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-sky-500/30 to-transparent rounded-t"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>

              <div className="relative z-10">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/10 to-sky-500/10 border border-emerald-500/20 mb-4 mx-auto">
                  <TrendingUp className="h-7 w-7 text-emerald-500" />
                </div>
                <h3 className="text-lg font-medium tracking-tight mb-2">No data yet</h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                  Add a website and create your first popup to see performance trends.
                </p>
              </div>
            </div>
          )}

          {/* Legend */}
          {hasData && hasChartData && (
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-sky-500" />
                <span className="text-sm text-muted-foreground">Visitors</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                <span className="text-sm text-muted-foreground">Conversions</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </BlurFade>
  );
}
