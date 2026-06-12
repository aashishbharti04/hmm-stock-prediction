import type { MetadataRoute } from 'next';
import { PROJECT_NAME } from '@/lib/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${PROJECT_NAME} — HMM Market Regime Dashboard`,
    short_name: PROJECT_NAME,
    description:
      'Detect hidden market regimes and forecast stock prices using Hidden Markov Models.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0b1120',
    theme_color: '#2563eb',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
