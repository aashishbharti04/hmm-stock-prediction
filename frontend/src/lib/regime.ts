import type { RegimeLabel, StateStats } from '@/types/analysis';

/**
 * Deterministic color + styling for a regime, driven by its label so charts,
 * badges, and tables stay visually consistent.
 */
export interface RegimeStyle {
  /** HSL color string used by Recharts (cannot read CSS vars at runtime). */
  color: string;
  /** Tailwind classes for badges/text. */
  badgeClass: string;
}

const STYLES: Record<string, RegimeStyle> = {
  Bullish: {
    color: 'hsl(142 71% 45%)',
    badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  },
  Bearish: {
    color: 'hsl(0 72% 51%)',
    badgeClass: 'bg-red-500/15 text-red-600 dark:text-red-400',
  },
  Neutral: {
    color: 'hsl(38 92% 50%)',
    badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  },
};

const FALLBACK_PALETTE = [
  'hsl(217 91% 60%)',
  'hsl(280 65% 60%)',
  'hsl(199 89% 48%)',
  'hsl(330 81% 60%)',
  'hsl(160 84% 39%)',
];

export function regimeStyle(label: RegimeLabel, state = 0): RegimeStyle {
  if (STYLES[label]) return STYLES[label];
  if (label.startsWith('Neutral')) return STYLES.Neutral;
  return {
    color: FALLBACK_PALETTE[state % FALLBACK_PALETTE.length],
    badgeClass: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
  };
}

/** Build a quick lookup from state id → its stats. */
export function indexStates(states: StateStats[]): Map<number, StateStats> {
  return new Map(states.map((s) => [s.state, s]));
}
