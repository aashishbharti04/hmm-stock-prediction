'use client';

import { useState } from 'react';
import type { AnalysisParams } from '@/types/analysis';
import { ApiError } from '@/lib/api';
import { useAnalysis } from '@/lib/hooks';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { ChartSkeleton, StatCardSkeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { Controls } from './Controls';
import { StatCards } from './StatCards';
import { PriceChart } from './PriceChart';
import { ForecastChart } from './ForecastChart';
import { StatesTable } from './StatesTable';
import { TransitionMatrix } from './TransitionMatrix';
import { Diagnostics } from './Diagnostics';
import { ErrorState } from './states';

const DEFAULT_PARAMS: AnalysisParams = {
  ticker: 'AAPL',
  period: '2y',
  interval: '1d',
  n_states: 3,
  forecast_days: 5,
  auto_select_states: false,
  selection_criterion: 'bic',
};

export function Dashboard() {
  const [params, setParams] = useState<AnalysisParams>(DEFAULT_PARAMS);
  const { data, isLoading, isError, error, isFetching, refetch } =
    useAnalysis(params);

  const isDemo = data?.currency === 'DEMO';

  return (
    <div className="space-y-6">
      <Controls
        initial={params}
        loading={isFetching}
        onSubmit={setParams}
      />

      {isDemo && data && (
        <div
          role="status"
          className="rounded-md border border-neutral/30 bg-neutral/10 px-4 py-2.5 text-sm text-foreground"
        >
          <strong className="font-semibold">Demo mode:</strong> live market data
          was unavailable, so results use a built-in synthetic dataset. Start the
          backend to analyze real tickers.
        </div>
      )}

      {isLoading && <LoadingView />}

      {isError && !data && (
        <ErrorState
          message={
            error instanceof ApiError ? error.message : 'Unexpected error.'
          }
          onRetry={() => refetch()}
        />
      )}

      {data && (
        <div className="animate-fade-in space-y-6">
          <StatCards data={data} />

          <Card>
            <CardHeader
              title={`${data.ticker} — Price & Market Regimes`}
              description={`${data.prices.length} sessions · ${data.period} · ${data.n_states} hidden states`}
              action={
                <div className="flex items-center gap-2">
                  {data.cached && (
                    <Badge className="bg-neutral/15 text-muted-foreground">
                      cached
                    </Badge>
                  )}
                  <Badge className="bg-primary/10 text-primary">
                    logL {data.log_likelihood.toFixed(1)}
                  </Badge>
                </div>
              }
            />
            <CardBody>
              <PriceChart data={data} />
            </CardBody>
          </Card>

          <Diagnostics data={data} />

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
