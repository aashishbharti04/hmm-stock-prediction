import type { AnalysisResponse } from '@/types/analysis';
import { Badge } from '@/components/ui/Badge';
import { regimeStyle } from '@/lib/regime';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/format';

/** Headline KPI cards summarising the latest analysis. */
export function StatCards({ data }: { data: AnalysisResponse }) {
  const latest = regimeStyle(data.latest_state_label, data.latest_state);
  const latestStats = data.states.find((s) => s.state === data.latest_state);

  const cards = [
    {
      label: 'Latest Close',
      value: formatCurrency(data.latest_close, data.currency),
      sub: `as of ${data.as_of}`,
    },
    {
      label: 'Current Regime',
      value: (
        <Badge className={latest.badgeClass}>
          <span className="h-2 w-2 rounded-full" style={{ background: latest.color }} />
          {data.latest_state_label}
        </Badge>
      ),
      sub: latestStats ? `${formatPercent(latestStats.frequency)} of history` : '',
    },
    {
      label: 'Hidden States',
      value: formatNumber(data.n_states, 0),
      sub: 'market regimes modeled',
    },
    {
      label: 'Log-Likelihood',
      value: formatNumber(data.log_likelihood, 1),
      sub: 'model fit quality',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="card p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {c.label}
          </p>
          <div className="mt-2 text-2xl font-semibold tracking-tight">{c.value}</div>
          <p className="mt-1 truncate text-xs text-muted-foreground">{c.sub}</p>
        </div>
      ))}
    </div>
  );
}
