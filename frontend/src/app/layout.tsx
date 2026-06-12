import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PROJECT_NAME, REPO_URL } from '@/lib/site';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const description =
  'Detect hidden market regimes (bullish, bearish, neutral) and forecast stock prices using Gaussian Hidden Markov Models. Interactive, open-source dashboard.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${PROJECT_NAME} — HMM Market Regime Dashboard`,
    template: `%s · ${PROJECT_NAME}`,
  },
  description,
  applicationName: PROJECT_NAME,
  keywords: [
    'Hidden Markov Model',
    'HMM',
    'stock prediction',
    'market regime',
    'quantitative finance',
    'time series forecasting',
    'machine learning',
  ],
  authors: [{ name: 'Aashish Bharti', url: REPO_URL }],
  openGraph: {
    type: 'website',
    title: `${PROJECT_NAME} — HMM Market Regime Dashboard`,
    description,
    url: siteUrl,
    siteName: PROJECT_NAME,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${PROJECT_NAME} — HMM Market Regime Dashboard`,
    description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1120' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${mono.variable}`}>
      <body className="min-h-screen app-gradient">
        <ThemeProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
          >
            Skip to content
          </a>
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
