import Link from 'next/link';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5" aria-label="HMM Stock Prediction home">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 17l5-6 4 4 6-8" />
              <path d="M3 21h18" />
            </svg>
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-tight">HMM Market Regimes</span>
            <span className="text-[11px] text-muted-foreground">Hidden Markov stock forecasting</span>
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          <a
            href="https://github.com/aashishbharti04/hmm-stock-prediction"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden h-9 items-center rounded-md border border-border px-3 text-sm font-medium transition-colors hover:bg-muted sm:inline-flex"
          >
            GitHub
          </a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
