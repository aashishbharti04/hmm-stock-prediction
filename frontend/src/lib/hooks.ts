import { useQuery } from '@tanstack/react-query';
import type {
  AnalysisParams,
  AnalysisResponse,
  BacktestParams,
  BacktestResponse,
} from '@/types/analysis';
import { fetchAnalysis, fetchBacktest } from '@/lib/api';

/** Stable cache key for a set of analysis parameters. */
function analysisKey(params: AnalysisParams) {
  return ['analysis', params] as const;
}

/**
 * Fetch an HMM analysis with caching, retries and cancellation handled by
 * TanStack Query. Degrades to in-browser sample data when the API is offline.
 */
export function useAnalysis(params: AnalysisParams, enabled = true) {
  return useQuery<AnalysisResponse>({
    queryKey: analysisKey(params),
    queryFn: ({ signal }) =>
      fetchAnalysis(params, { signal, fallbackToSample: true }),
    enabled,
  });
}

/** Fetch a walk-forward backtest. Disabled until explicitly requested. */
export function useBacktest(params: BacktestParams, enabled: boolean) {
  return useQuery<BacktestResponse>({
    queryKey: ['backtest', params],
    queryFn: ({ signal }) => fetchBacktest(params, { signal }),
    enabled,
    staleTime: 10 * 60 * 1000,
  });
}
