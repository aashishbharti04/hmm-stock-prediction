import Link from 'next/link';
import { SOCIAL_LINKS, CONTACT_EMAIL, PROJECT_NAME } from '@/lib/site';

const QUICK_LINKS = [
  { href: '/', label: 'Dashboard' },
  { href: '/guide', label: 'User Guide' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

/**
 * Professional site footer: project blurb, contact, social links, copyright,
 * and an open-source notice. Links open safely in a new tab.
 */
export function Footer() {
  const year = 2026; // build-time constant; bump in CHANGELOG on release

  return (
    <footer className="mt-16 border-t border-border bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {/* Brand + blurb */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 17l5-6 4 4 6-8" />
                <path d="M3 21h18" />
              </svg>
            </span>
            <span className="text-sm font-semibold">{PROJECT_NAME}</span>
          </div>
          <p className="max-w-xs text-sm text-muted-foreground">
            Detect hidden market regimes and forecast prices using Gaussian
            Hidden Markov Models. Built for learning and research — not financial
            advice.
          </p>
        </div>

        {/* Quick links */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Navigate
          </h4>
          <ul className="space-y-2">
            {QUICK_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Contact
          </h4>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex items-center gap-2 text-sm text-foreground transition-colors hover:text-primary"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-10 6L2 7" />
            </svg>
            {CONTACT_EMAIL}
          </a>
        </div>

        {/* Social */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Connect
          </h4>
          <ul className="flex flex-wrap gap-2">
            {SOCIAL_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <span dangerouslySetInnerHTML={{ __html: link.icon }} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>© {year} {PROJECT_NAME}. All rights reserved.</p>
          <p>
            This project is open source and available for educational, learning,
            and community contributions.
          </p>
        </div>
      </div>
    </footer>
  );
}
