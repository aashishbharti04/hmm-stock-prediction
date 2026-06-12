import type { AnalysisResponse } from '@/types/analysis';
import { regimeStyle } from '@/lib/regime';
import { formatPercent } from '@/lib/format';

/** Per-regime statistics table (annualised-friendly daily figures). */
export function StatesTable({ data }: { data: AnalysisResponse }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <caption className="sr-only">Statistics for each inferred hidden state</caption>
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
            <th scope="col" className="py-2 pr-4 font-medium">Regime</th>
            <th scope="col" className="py-2 pr-4 text-right font-medium">Mean Return</th>
            <th scope="col" className="py-2 pr-4 text-right font-medium">Volatility</th>
            <th scope="col" className="py-2 pr-4 text-right font-medium">Days</th>
            <th scope="col" className="py-2 text-right font-medium">Frequency</th>
          </tr>
        </thead>
        <tbody>
          {data.states.map((s) => {
            const style = regimeStyle(s.label, s.state);
            const positive = s.mean_return >= 0;
            return (
              <tr key={s.state} className="border-b border-border/60 last:border-0">
                <td className="py-3 pr-4">
                  <span className="inline-flex items-center gap-2 font-medium">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: style.color }} />
                    {s.label}
                  </span>
                </td>
                <td className={`py-3 pr-4 text-right tabular-nums ${positive ? 'text-bullish' : 'text-bearish'}`}>
                  {positive ? '+' : ''}
                  {formatPercent(s.mean_return, 3)}
                </td>
                <td className="py-3 pr-4 text-right tabular-nums text-muted-foreground">
                  {formatPercent(s.volatility, 2)}
                </td>
                <td className="py-3 pr-4 text-right tabular-nums">{s.count}</td>
                <td className="py-3 text-right tabular-nums">{formatPercent(s.frequency, 1)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
