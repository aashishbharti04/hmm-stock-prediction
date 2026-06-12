'use client';

import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { AnalysisResponse } from '@/types/analysis';
import { regimeStyle, indexStates } from '@/lib/regime';
import { formatCurrency, formatDate } from '@/lib/format';

/**
 * Close-price area chart with a regime "ribbon" underneath that colors each
 * trading day by its inferred hidden state. The ribbon makes regime shifts
 * legible without overplotting the price line.
 */
export function PriceChart({ data }: { data: AnalysisResponse }) {
  const series = useMemo(
    () => data.prices.map((p) => ({ date: p.date, close: p.close, state: p.state })),
    [data.prices],
  );
  const stateIndex = useMemo(() => indexStates(data.states), [data.states]);

  return (
    <div className="space-y-2">
      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="closeFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={(v) => formatDate(v).replace(/,.*/, '')}
              minTickGap={48}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              stroke="hsl(var(--border))"
            />
            <YAxis
              domain={['auto', 'auto']}
              width={56}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              stroke="hsl(var(--border))"
              tickFormatter={(v) => formatCurrency(Number(v), data.currency).replace(/\.\d+/, '')}
            />
            <Tooltip
              contentStyle={{
                background: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 12,
                fontSize: 12,
                color: 'hsl(var(--card-foreground))',
              }}
              labelFormatter={(v) => formatDate(String(v))}
              formatter={(value: number, _name, item) => {
                const st = (item?.payload as { state: number })?.state ?? 0;
                const label = stateIndex.get(st)?.label ?? `State ${st}`;
                return [formatCurrency(value, data.currency), label];
              }}
            />
            <Area
              type="monotone"
              dataKey="close"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#closeFill)"
              isAnimationActive={false}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Regime ribbon */}
      <div className="flex h-3 w-full overflow-hidden rounded-full" aria-hidden="true">
        {series.map((p, i) => {
          const st = stateIndex.get(p.state);
          const style = regimeStyle(st?.label ?? `State ${p.state}`, p.state);
          return (
            <span
              key={i}
              className="h-full flex-1"
              style={{ background: style.color }}
              title={`${p.date}: ${st?.label ?? ''}`}
            />
          );
        })}
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Regime ribbon — each segment is one trading day colored by its hidden state
      </p>
    </div>
  );
}
