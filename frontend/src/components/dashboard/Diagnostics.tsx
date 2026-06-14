import type { AnalysisResponse } from '@/types/analysis';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

/**
 * Model goodness-of-fit diagnostics. Shows AIC/BIC/log-likelihood and, when the
 * regime count was auto-selected, the full candidate comparison so the choice
 * is transparent.
 */
export function Diagnostics({ data }: { data: AnalysisResponse }) {
  const d = data.diagnostics;
  const candidates = d.candidates ?? [];

  return (
    <Card>
      <CardHeader
        title="Model Diagnostics"
        description="Goodness-of-fit and regime-count selection"
        action={
          d.converged ? (
            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              converged
            </Badge>
          ) : (
            <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400">
              not converged
            </Badge>
          )
        }
      />
      <CardBody>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Metric label="Log-likelihood" value={d.log_likelihood.toFixed(1)} />
          <Metric label="AIC" value={d.aic.toFixed(1)} />
          <Metric label="BIC" value={d.bic.toFixed(1)} />
          <Metric label="Free params" value={String(d.n_params)} />
        </dl>

        {candidates.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Regime-count search (selected by{' '}
              <span className="uppercase">{d.selected_by}</span> — lower is
              better)
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground">
                    <th className="py-1.5 pr-4 font-medium">States</th>
                    <th className="py-1.5 pr-4 font-medium">Log-likelihood</th>
                    <th className="py-1.5 pr-4 font-medium">AIC</th>
                    <th className="py-1.5 pr-4 font-medium">BIC</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((c) => {
                    const selected = c.n_states === data.n_states;
                    return (
                      <tr
                        key={c.n_states}
                        className={
                          selected
                            ? 'rounded bg-primary/5 font-semibold text-primary'
                            : 'text-foreground'
                        }
                      >
                        <td className="py-1.5 pr-4">
                          {c.n_states}
                          {selected && ' ★'}
                        </td>
                        <td className="py-1.5 pr-4">
                          {c.log_likelihood.toFixed(1)}
                        </td>
                        <td className="py-1.5 pr-4">{c.aic.toFixed(1)}</td>
                        <td className="py-1.5 pr-4">{c.bic.toFixed(1)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-mono text-lg font-semibold tabular-nums">
        {value}
      </dd>
    </div>
  );
}
