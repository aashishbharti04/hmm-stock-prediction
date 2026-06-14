/**
 * Shared types mirroring the backend `AnalysisResponse` contract.
 * Keep in sync with `backend/app/schemas/stock.py`.
 */

export type RegimeLabel = 'Bullish' | 'Bearish' | 'Neutral' | string;

export interface PricePoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  log_return: number;
  state: number;
}

export interface StateStats {
  state: number;
  label: RegimeLabel;
  count: number;
  mean_return: number;
  volatility: number;
  frequency: number;
}

export interface ForecastPoint {
  step: number;
  predicted_close: number;
  lower_bound: number;
  upper_bound: number;
}

export interface TransitionMatrix {
  states: number[];
  matrix: number[][];
}

export interface ModelCandidate {
  n_states: number;
  log_likelihood: number;
  aic: number;
  bic: number;
  converged: boolean;
}

export interface ModelDiagnostics {
  log_likelihood: number;
  aic: number;
  bic: number;
  n_params: number;
  converged: boolean;
  selected_by: string | null;
  candidates: ModelCandidate[];
}

export interface AnalysisResponse {
  ticker: string;
  period: string;
  interval: string;
  n_states: number;
  currency: string;
  as_of: string;
  latest_close: number;
  latest_state: number;
  latest_state_label: RegimeLabel;
  log_likelihood: number;
  diagnostics: ModelDiagnostics;
  cached: boolean;
  prices: PricePoint[];
  states: StateStats[];
  transitions: TransitionMatrix;
  forecast: ForecastPoint[];
}

export interface AnalysisParams {
  ticker: string;
  period: string;
  interval: string;
  n_states: number;
  forecast_days: number;
  auto_select_states?: boolean;
  selection_criterion?: 'bic' | 'aic';
}

export interface BacktestPoint {
  date: string;
  actual_close: number;
  predicted_close: number;
  correct_direction: boolean;
}

export interface BacktestResponse {
  ticker: string;
  n_states: number;
  folds: number;
  directional_accuracy: number;
  baseline_accuracy: number;
  rmse: number;
  mape: number;
  points: BacktestPoint[];
}

export interface BacktestParams extends AnalysisParams {
  stride?: number;
  max_folds?: number;
}
