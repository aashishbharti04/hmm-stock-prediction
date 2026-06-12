import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'User Guide',
  description:
    'Learn how to use the Hidden Markov Model dashboard: run an analysis, read regimes, interpret the forecast, and understand the model.',
};

const STEPS = [
  {
    n: 1,
    title: 'Enter a ticker symbol',
    body: 'Type a valid stock symbol such as AAPL, MSFT, TSLA, or GOOGL into the Ticker field. Symbols may contain letters, digits, dots, and dashes (e.g. BRK.B).',
  },
  {
    n: 2,
    title: 'Choose the look-back period',
    body: 'Pick how much history to analyze (6 months to 5 years). More history gives the model more data to learn regimes from, but very old data may be less relevant to current conditions.',
  },
  {
    n: 3,
    title: 'Set the number of hidden states',
    body: 'Choose 2–5 regimes. Three is a good default (bullish, bearish, neutral). More states can capture finer structure but need more data and can overfit.',
  },
  {
    n: 4,
    title: 'Set the forecast horizon',
    body: 'Choose how many future days (1–30) to project. Remember: uncertainty grows quickly with the horizon — short forecasts are more reliable.',
  },
  {
    n: 5,
    title: 'Run the analysis',
    body: 'Click “Run analysis”. The app fetches data, fits the HMM, decodes the regimes, and renders the charts. A loading skeleton appears while it works.',
  },
];

const READING = [
  {
    title: 'KPI cards',
    body: 'A quick summary: latest close price, the current regime, the number of hidden states modeled, and the log-likelihood (a measure of model fit — higher is better).',
  },
  {
    title: 'Price & regime ribbon',
    body: 'The area chart shows closing prices. The colored ribbon beneath it marks each trading day by its inferred regime — green (bullish), red (bearish), amber (neutral) — so you can see when the market switched states.',
  },
  {
    title: 'Forecast chart',
    body: 'The solid line is recent actual prices; the dashed line is the projected path. The shaded band is a 95% uncertainty interval that widens with the horizon.',
  },
  {
    title: 'Regime transitions',
    body: 'A heatmap of the probability of moving from one regime to another tomorrow. The diagonal (staying in the same regime) is usually highest — markets tend to persist in a state.',
  },
  {
    title: 'Regime statistics',
    body: 'For each regime: average daily return, volatility, number of days observed, and how frequently it occurred. This characterizes what each hidden state “means”.',
  },
];

export default function GuidePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="User Guide"
        title="How to use the dashboard"
        description="A step-by-step walkthrough of running an analysis, reading the charts, and understanding what the Hidden Markov Model is telling you."
      />

      {/* Steps */}
      <section aria-labelledby="run-heading" className="mb-12">
        <h2 id="run-heading" className="mb-4 text-xl font-semibold tracking-tight">
          Running an analysis
        </h2>
        <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {STEPS.map((s) => (
            <li key={s.n}>
              <Card className="h-full">
                <CardBody className="pt-5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {s.n}
                  </span>
                  <h3 className="mt-3 text-sm font-semibold">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{s.body}</p>
                </CardBody>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      {/* Reading results */}
      <section aria-labelledby="read-heading" className="mb-12">
        <h2 id="read-heading" className="mb-4 text-xl font-semibold tracking-tight">
          Reading the results
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {READING.map((r) => (
            <Card key={r.title}>
              <CardHeader title={r.title} />
              <CardBody>
                <p className="text-sm text-muted-foreground">{r.body}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section aria-labelledby="how-heading" className="mb-12">
        <h2 id="how-heading" className="mb-4 text-xl font-semibold tracking-tight">
          How the model works
        </h2>
        <Card>
          <CardBody className="space-y-4 pt-5 text-sm leading-relaxed text-muted-foreground">
            <p>
              A <strong className="text-foreground">Hidden Markov Model (HMM)</strong>{' '}
              assumes the market moves through unobserved “hidden” states. We can&apos;t
              see the state directly, but each state produces observable signals — here,
              daily <em>log-returns</em>.
            </p>
            <ol className="ml-5 list-decimal space-y-2">
              <li>Daily log-returns are computed from closing prices.</li>
              <li>
                A Gaussian HMM is fit to those returns using the{' '}
                <strong className="text-foreground">Baum–Welch</strong> (EM) algorithm.
              </li>
              <li>
                The most-likely sequence of hidden states is decoded with the{' '}
                <strong className="text-foreground">Viterbi</strong> algorithm.
              </li>
              <li>States are labelled bullish/bearish/neutral by their mean return.</li>
              <li>
                The forecast propagates the current state distribution forward through the
                transition matrix and blends each state&apos;s expected return.
              </li>
            </ol>
            <p>
              For a deeper dive, see the{' '}
              <a
                href="https://github.com/aashishbharti04/hmm-stock-prediction/blob/main/docs/ARCHITECTURE.md"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                architecture documentation
              </a>{' '}
              and the included research PDF.
            </p>
          </CardBody>
        </Card>
      </section>

      {/* Disclaimer */}
      <div className="rounded-lg border border-neutral/30 bg-neutral/10 p-5 text-sm">
        <strong className="font-semibold">Important:</strong> This tool is for educational
        and research purposes only and is <strong>not financial advice</strong>. Regime
        labels and forecasts are model estimates, not guarantees. Never make investment
        decisions based solely on this dashboard.
      </div>

      <div className="mt-8">
        <Link
          href="/"
          className="inline-flex h-10 items-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Try it now →
        </Link>
      </div>
    </div>
  );
}
