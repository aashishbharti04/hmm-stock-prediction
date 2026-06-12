'use client';

import { useState } from 'react';
import type { AnalysisParams } from '@/types/analysis';

const PERIODS = ['6mo', '1y', '2y', '5y'] as const;
const STATES = [2, 3, 4, 5] as const;

const fieldClass =
  'h-10 rounded-md border border-input bg-card px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-ring';
const labelClass = 'text-xs font-medium text-muted-foreground';

/** Analysis input form. Controlled, validated, and accessible. */
export function Controls({
  initial,
  loading,
  onSubmit,
}: {
  initial: AnalysisParams;
  loading: boolean;
  onSubmit: (params: AnalysisParams) => void;
}) {
  const [ticker, setTicker] = useState(initial.ticker);
  const [period, setPeriod] = useState(initial.period);
  const [nStates, setNStates] = useState(initial.n_states);
  const [forecastDays, setForecastDays] = useState(initial.forecast_days);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const clean = ticker.trim().toUpperCase();
    if (!clean) return;
    onSubmit({
      ticker: clean,
      period,
      interval: '1d',
      n_states: nStates,
      forecast_days: forecastDays,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card flex flex-col gap-4 p-5 md:flex-row md:items-end md:gap-3"
      aria-label="Analysis parameters"
    >
      <div className="flex flex-1 flex-col gap-1.5">
        <label htmlFor="ticker" className={labelClass}>
          Ticker symbol
        </label>
        <input
          id="ticker"
          name="ticker"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          placeholder="AAPL"
          autoComplete="off"
          spellCheck={false}
          maxLength={12}
          className={fieldClass}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="period" className={labelClass}>
          Period
        </label>
        <select
          id="period"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className={fieldClass}
        >
          {PERIODS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="states" className={labelClass}>
          Hidden states
        </label>
        <select
          id="states"
          value={nStates}
          onChange={(e) => setNStates(Number(e.target.value))}
          className={fieldClass}
        >
          {STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="forecast" className={labelClass}>
          Forecast (days)
        </label>
        <input
          id="forecast"
          type="number"
          min={1}
          max={30}
          value={forecastDays}
          onChange={(e) => setForecastDays(Number(e.target.value))}
          className={`${fieldClass} w-28`}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <Spinner /> Analyzing…
          </>
        ) : (
          'Run analysis'
        )}
      </button>
    </form>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4z" />
    </svg>
  );
}
