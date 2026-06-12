import type { AnalysisResponse } from '@/types/analysis';
import { regimeStyle, indexStates } from '@/lib/regime';

/**
 * Heatmap of the estimated transition matrix P(next | current). Cell opacity
 * encodes probability; the diagonal (regime persistence) is usually darkest.
 */
export function TransitionMatrix({ data }: { data: AnalysisResponse }) {
  const idx = indexStates(data.states);
  const { states, matrix } = data.transitions;
  const labelFor = (s: number) => idx.get(s)?.label ?? `S${s}`;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-1 text-sm">
        <caption className="sr-only">Transition probabilities between regimes</caption>
        <thead>
          <tr>
            <th className="p-2 text-left text-xs font-medium text-muted-foreground">From \ To</th>
            {states.map((s) => (
              <th key={s} className="p-2 text-xs font-medium text-muted-foreground">
                {labelFor(s)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => {
            const style = regimeStyle(labelFor(states[i]), states[i]);
            return (
              <tr key={i}>
                <th scope="row" className="p-2 text-left text-xs font-medium text-muted-foreground">
                  {labelFor(states[i])}
                </th>
                {row.map((p, j) => (
                  <td
                    key={j}
                    className="rounded-md p-2 text-center text-xs font-medium tabular-nums"
                    style={{
                      // Convert `hsl(H S% L%)` → `hsl(H S% L% / opacity)`.
                      background: style.color.replace(')', ` / ${Math.max(p, 0.04)})`),
                      color: p > 0.5 ? 'white' : 'hsl(var(--foreground))',
                    }}
                    title={`P(${labelFor(states[j])} | ${labelFor(states[i])}) = ${p}`}
                  >
                    {(p * 100).toFixed(0)}%
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
