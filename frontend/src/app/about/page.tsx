import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { REPO_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About',
  description:
    'About the Hidden Markov Model and Future Prediction of Stock Market project — its purpose, technology, and the team behind it.',
};

const FEATURES = [
  ['Regime detection', 'Identify bullish, bearish, and neutral market states from price history.'],
  ['Probabilistic forecasting', 'Project future prices with a 95% uncertainty band, not a single guess.'],
  ['Transition analysis', 'Quantify how likely the market is to switch or stay in a regime.'],
  ['Open source', 'MIT-licensed, documented, and built for learning and contribution.'],
];

const STACK = [
  ['Frontend', 'Next.js 14, TypeScript, Tailwind CSS, Recharts'],
  ['Backend', 'Python, FastAPI, hmmlearn, scikit-learn, NumPy, pandas'],
  ['Data', 'yfinance market data with an offline synthetic fallback'],
  ['Tooling', 'pytest, ruff, mypy, ESLint, GitHub Actions CI'],
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="About"
        title="About this project"
        description="Hidden Markov Model and Future Prediction of Stock Market is an open-source dashboard that brings academic time-series modeling to an interactive, approachable interface."
      />

      <section className="mb-12 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Our mission" />
          <CardBody className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              Financial markets are noisy, but beneath the noise they tend to move through
              distinct <em>regimes</em> — periods of growth, decline, and consolidation.
              Hidden Markov Models are a classic, principled way to uncover those hidden
              regimes from observable data.
            </p>
            <p>
              This project makes that technique tangible: enter a ticker, and watch the
              model reveal the market&apos;s hidden states and project where it might go
              next — all explained visually, with the math documented and the code open
              for anyone to study, run, and extend.
            </p>
            <p>
              It grew out of a research write-up on applying HMMs to stock-market
              prediction (included as a PDF in the repository) and evolved into a
              production-ready, full-stack application.
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="At a glance" />
          <CardBody>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">License</dt>
                <dd className="font-medium">MIT</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Status</dt>
                <dd className="font-medium">v1.0 · Active</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Type</dt>
                <dd className="font-medium">Open source</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Purpose</dt>
                <dd className="font-medium text-right">Education &amp; research</dd>
              </div>
            </dl>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-md border border-border text-sm font-medium transition-colors hover:bg-muted"
            >
              View on GitHub
            </a>
          </CardBody>
        </Card>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold tracking-tight">What it does</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map(([title, body]) => (
            <Card key={title}>
              <CardBody className="pt-5">
                <h3 className="text-sm font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-xl font-semibold tracking-tight">Technology</h2>
        <Card>
          <CardBody className="pt-5">
            <dl className="divide-y divide-border">
              {STACK.map(([k, v]) => (
                <div key={k} className="flex flex-col gap-1 py-3 sm:flex-row sm:gap-6">
                  <dt className="w-28 shrink-0 text-sm font-semibold">{k}</dt>
                  <dd className="text-sm text-muted-foreground">{v}</dd>
                </div>
              ))}
            </dl>
          </CardBody>
        </Card>
      </section>

      <div className="rounded-lg border border-neutral/30 bg-neutral/10 p-5 text-sm">
        <strong className="font-semibold">Disclaimer:</strong> For educational and research
        purposes only. Nothing here is financial advice.
      </div>
    </div>
  );
}
