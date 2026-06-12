'use client';

import { useMemo } from 'react';
import {
  Area,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import type { AnalysisResponse } from '@/types/analysis';
import { formatCurrency } from '@/lib/format';

/**
 * Forecast chart: the last slice of historical close prices joined to the
 * predicted path, with a shaded 95% uncertainty band.
 */
export function ForecastChart({ data }: { data: AnalysisResponse }) {
  const rows = useMemo(() => {
    const tail = data.prices.slice(-30).map((p) => ({
      label: p.date,
      actual: p.close,
      predicted: null as number | null,
      lower: null as number | null,
      upper: null as number | null,
    }));
    // Bridge the last actual point into the forecast for a continuous line.
    const lastActual = tail[tail.length - 1];
    const bridge = data.forecast.map((f) => ({
      label: `+${f.step}d`,
      actual: null as number | null,
      predicted: f.predicted_close,
      lower: f.lower_bound,
      upper: f.upper_bound,
    }));
    if (lastActual) {
      lastActual.predicted = lastActual.actual;
      lastActual.lower = lastActual.actual;
      lastActual.upper = lastActual.actual;
    }
    return [...tail, ...bridge];
  }, [data.prices, data.forecast]);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={rows} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis
            dataKey="label"
            minTickGap={40}
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            stroke="hsl(var(--border))"
            tickFormatter={(v) => String(v).replace(/^\d{4}-/, '')}
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
            formatter={(value, name) => {
              const num = typeof value === 'number' ? value : Number(value);
              return Number.isFinite(num)
                ? [formatCurrency(num, data.currency), name]
                : ['—', name];
            }}
          />
          <Area
            dataKey="upper"
            stroke="none"
            fill="hsl(var(--primary))"
            fillOpacity={0.12}
            isAnimationActive={false}
            connectNulls
          />
          <Area
            dataKey="lower"
            stroke="none"
            fill="hsl(var(--background))"
            fillOpacity={1}
            isAnimationActive={false}
            connectNulls
          />
          <Line
            dataKey="actual"
            name="Actual"
            stroke="hsl(var(--foreground))"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            connectNulls
          />
          <Line
            dataKey="predicted"
            name="Forecast"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={false}
            isAnimationActive={false}
            connectNulls
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
