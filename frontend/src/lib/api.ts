import type {
  AnalysisParams,
  AnalysisResponse,
  BacktestParams,
  BacktestResponse,
} from '@/types/analysis';
import { buildSampleResponse } from '@/lib/sample-data';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api/v1';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Request an HMM analysis from the backend.
 *
 * On network failure the caller can opt into a deterministic in-browser sample
 * via `fallbackToSample` so the dashboard degrades gracefully instead of
 * showing a hard error (useful for static previews and offline demos).
 */
export async function fetchAnalysis(
  params: AnalysisParams,
  options: { signal?: AbortSignal; fallbackToSample?: boolean } = {},
): Promise<AnalysisResponse> {
  try {
    const res = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
      signal: options.signal,
      cache: 'no-store',
    });

    if (!res.ok) {
      let detail = `Request failed (${res.status})`;
      try {
        const data = await res.json();
        if (data?.detail) detail = String(data.detail);
      } catch {
        /* ignore body parse errors */
      }
      throw new ApiError(detail, res.status);
    }

    return (await res.json()) as AnalysisResponse;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err;
    }
    if (options.fallbackToSample) {
      return buildSampleResponse(params.ticker || 'DEMO');
    }
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      'Could not reach the analysis service. Is the backend running?',
      0,
    );
  }
}

/** Request a walk-forward backtest of the one-step forecast. */
export async function fetchBacktest(
  params: BacktestParams,
  options: { signal?: AbortSignal } = {},
): Promise<BacktestResponse> {
  const res = await fetch(`${API_BASE}/backtest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
    signal: options.signal,
    cache: 'no-store',
  });

  if (!res.ok) {
    let detail = `Backtest failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.detail) detail = String(data.detail);
    } catch {
      /* ignore body parse errors */
    }
    throw new ApiError(detail, res.status);
  }

  return (await res.json()) as BacktestResponse;
}
