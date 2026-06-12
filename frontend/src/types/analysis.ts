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
}
