'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { AnalysisParams, AnalysisResponse } from '@/types/analysis';
import { fetchAnalysis, ApiError } from '@/lib/api';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { ChartSkeleton, StatCardSkeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { Controls } from './Controls';
import { StatCards } from './StatCards';
import { PriceChart } from './PriceChart';
import { ForecastChart } from './ForecastChart';
import { StatesTable } from './StatesTable';
import { TransitionMatrix } from './TransitionMatrix';
import { EmptyState, ErrorState } from './states';

const DEFAULT_PARAMS: AnalysisParams = {
  ticker: 'AAPL',
  period: '2y',
  interval: '1d',
  n_states: 3,
  forecast_days: 5,
};

type Status = 'idle' | 'loading' | 'success' | 'error';

export function Dashboard() {
  const [status, setStatus] = useState<Status>('idle');
  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [params, setParams] = useState<AnalysisParams>(DEFAULT_PARAMS);
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(async (next: AnalysisParams) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setParams(next);
    setStatus('loading');
    setError('');

    try {
      const result = await fetchAnalysis(next, {
        signal: controller.signal,
        // Degrade gracefully to in-browser sample data if the API is offline.
        fallbackToSample: true,
      });
      setData(result);
      setStatus('success');
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setError(err instanceof ApiError ? err.message : 'Unexpected error.');
      setStatus('error');
    }
  }, []);

  // Run a default analysis on first mount so the dashboard is never empty.
  useEffect(() => {
    run(DEFAULT_PARAMS);
    return () => abortRef.current?.abort();
  }, [run]);

  const isDemo = data?.currency === 'DEMO';

  return (
    <div className="space-y-6">
      <Controls initial={params} loading={status === 'loading'} onSubmit={run} />

      {isDemo && status === 'success' && (
        <div
          role="status"
          className="rounded-md border border-neutral/30 bg-neutral/10 px-4 py-2.5 text-sm text-foreground"
        >
          <strong className="font-semibold">Demo mode:</strong> live market data
          was unavailable, so results use a built-in synthetic dataset. Start the
          backend to analyze real tickers.
        </div>
      )}

      {status === 'loading' && <LoadingView />}

      {status === 'error' && (
        <ErrorState message={error} onRetry={() => run(params)} />
      )}

      {status === 'idle' && <EmptyState />}

      {status === 'success' && data && (
        <div className="animate-fade-in space-y-6">
          <StatCards data={data} />

          <Card>
            <CardHeader
              title={`${data.ticker} — Price & Market Regimes`}
              description={`${data.prices.length} sessions · ${data.period} · ${data.n_states} hidden states`}
              action={
                <Badge className="bg-primary/10 text-primary">
                  logL {data.log_likelihood.toFixed(1)}
                </Badge>
              }
            />
            <CardBody>
              <PriceChart data={data} />
            </CardBody>
          </Card>

          <div className="grid gap-6 lg:grid-cols-5">
            <Card className="lg:col-span-3">
              <CardHeader
                title="Forecast"
                description={`Next ${data.forecast.length} sessions with 95% uncertainty band`}
              />
              <CardBody>
                <ForecastChart data={data} />
              </CardBody>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader
                title="Regime Transitions"
                description="P(next regime | current regime)"
              />
              <CardBody>
                <TransitionMatrix data={data} />
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardHeader
              title="Regime Statistics"
              description="Daily return profile of each inferred hidden state"
            />
            <CardBody>
              <StatesTable data={data} />
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}

function LoadingView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      <Card>
        <CardBody>
          <ChartSkeleton />
        </CardBody>
      </Card>
    </div>
  );
}
