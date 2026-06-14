import type { AnalysisResponse, PricePoint } from '@/types/analysis';

/**
 * Deterministic in-browser sample dataset.
 *
 * Used as a graceful fallback when the backend is unreachable (e.g. on a static
 * preview deploy or during the very first paint) so the dashboard is never
 * empty. It mimics a 3-regime market with a clear bull → bear → recovery arc.
 */

// Simple seeded PRNG (mulberry32) for reproducible demo data.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(rand: () => number): number {
  const u = 1 - rand();
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function buildPrices(): PricePoint[] {
  const rand = mulberry32(42);
  const drifts = [0.0011, -0.0016, 0.0002];
  const vols = [0.009, 0.024, 0.006];
  const trans = [
    [0.95, 0.03, 0.02],
    [0.05, 0.9, 0.05],
    [0.04, 0.03, 0.93],
  ];
  const n = 260;
  let state = 0;
  let close = 150;
  const start = new Date('2024-01-02').getTime();
  const points: PricePoint[] = [];

  for (let i = 0; i < n; i++) {
    const r = rand();
    let acc = 0;
    for (let s = 0; s < 3; s++) {
      acc += trans[state][s];
      if (r <= acc) {
        state = s;
        break;
      }
    }
    const logReturn = drifts[state] + vols[state] * gaussian(rand);
    const prevClose = close;
    close = close * Math.exp(logReturn);
    const date = new Date(start + i * 86400000).toISOString().slice(0, 10);
    points.push({
      date,
      open: +prevClose.toFixed(2),
      high: +(close * (1 + Math.abs(gaussian(rand)) * 0.004)).toFixed(2),
      low: +(close * (1 - Math.abs(gaussian(rand)) * 0.004)).toFixed(2),
      close: +close.toFixed(2),
      volume: Math.floor(5_000_000 + rand() * 45_000_000),
      log_return: +logReturn.toFixed(6),
      state,
    });
  }
  return points;
}

export function buildSampleResponse(ticker = 'DEMO'): AnalysisResponse {
  const prices = buildPrices();
  const byState = [0, 1, 2].map((s) => {
    const rs = prices.filter((p) => p.state === s).map((p) => p.log_return);
    const mean = rs.reduce((a, b) => a + b, 0) / Math.max(rs.length, 1);
    const variance =
      rs.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(rs.length, 1);
    return { s, count: rs.length, mean, vol: Math.sqrt(variance) };
  });

  const labels = ['Bullish', 'Bearish', 'Neutral'];
  const last = prices[prices.length - 1];

  return {
    ticker,
    period: '1y',
    interval: '1d',
    n_states: 3,
    currency: 'DEMO',
    as_of: last.date,
    latest_close: last.close,
    latest_state: last.state,
    latest_state_label: labels[last.state],
    log_likelihood: 812.34,
    diagnostics: {
      log_likelihood: 812.34,
      aic: -1610.68,
      bic: -1554.21,
      n_params: 14,
      converged: true,
      selected_by: null,
      candidates: [],
    },
    cached: false,
    prices,
    states: byState.map((b) => ({
      state: b.s,
      label: labels[b.s],
      count: b.count,
      mean_return: +b.mean.toFixed(6),
      volatility: +b.vol.toFixed(6),
      frequency: +(b.count / prices.length).toFixed(4),
    })),
    transitions: {
      states: [0, 1, 2],
      matrix: [
        [0.95, 0.03, 0.02],
        [0.05, 0.9, 0.05],
        [0.04, 0.03, 0.93],
      ],
    },
    forecast: Array.from({ length: 5 }, (_, i) => {
      const step = i + 1;
      const predicted = last.close * Math.exp(0.0006 * step);
      const band = predicted * 0.012 * Math.sqrt(step);
      return {
        step,
        predicted_close: +predicted.toFixed(2),
        lower_bound: +(predicted - 1.96 * band).toFixed(2),
        upper_bound: +(predicted + 1.96 * band).toFixed(2),
      };
    }),
  };
}
