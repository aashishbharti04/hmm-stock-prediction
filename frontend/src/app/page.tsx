import { Dashboard } from '@/components/dashboard/Dashboard';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="mb-8 max-w-3xl">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-bullish" />
          Gaussian Hidden Markov Model · live regime detection
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          See the market&apos;s hidden states
        </h1>
        <p className="mt-3 text-base text-muted-foreground sm:text-lg">
          This dashboard fits a Hidden Markov Model to a stock&apos;s returns to
          uncover latent regimes — bullish, bearish, and neutral — then projects
          a short-term forecast with an uncertainty band.
        </p>
      </section>

      <Dashboard />

      <p className="mt-8 text-center text-xs text-muted-foreground">
        For educational and research purposes only. Nothing here is financial advice.
      </p>
    </div>
  );
}
