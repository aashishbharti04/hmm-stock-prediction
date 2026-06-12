/**
 * Central site/brand constants. Single source of truth for links shown in the
 * header, footer, and SEO metadata.
 */

export const PROJECT_NAME = 'HMM Stock Prediction';

export const CONTACT_EMAIL = 'aashish@marketdoctorsonline.com';

export const REPO_URL = 'https://github.com/aashishbharti04/hmm-stock-prediction';

export interface SocialLink {
  label: string;
  href: string;
  /** Inline SVG markup for the brand icon (static, trusted constant). */
  icon: string;
}

export const SOCIAL_LINKS: SocialLink[] = [
  {
    label: 'LinkedIn',
    href: 'https://in.linkedin.com/in/aashana1012',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zM8.34 18.34V10.5H5.67v7.84h2.67zM7 9.32a1.55 1.55 0 1 0 0-3.1 1.55 1.55 0 0 0 0 3.1zm11.34 9.02v-4.3c0-2.3-1.23-3.37-2.87-3.37a2.48 2.48 0 0 0-2.25 1.24v-1.06h-2.67c.04.75 0 7.84 0 7.84h2.67v-4.38c0-.24.02-.48.09-.65.19-.48.63-.97 1.36-.97.96 0 1.34.73 1.34 1.8v4.2h2.83z"/></svg>',
  },
  {
    label: 'GitHub',
    href: 'https://github.com/aashishbharti04',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.48l-.01-1.7c-2.78.62-3.37-1.37-3.37-1.37-.46-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.36 1.12 2.94.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05a9.4 9.4 0 0 1 5 0c1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9l-.01 2.82c0 .27.18.59.69.48A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2z"/></svg>',
  },
  {
    label: 'YouTube',
    href: 'https://www.youtube.com/@CodeWithAsur',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23 12s0-3.4-.43-5.02a2.6 2.6 0 0 0-1.83-1.84C19.12 4.7 12 4.7 12 4.7s-7.12 0-8.74.44A2.6 2.6 0 0 0 1.43 6.98C1 8.6 1 12 1 12s0 3.4.43 5.02c.24.9.94 1.6 1.83 1.84 1.62.44 8.74.44 8.74.44s7.12 0 8.74-.44a2.6 2.6 0 0 0 1.83-1.84C23 15.4 23 12 23 12zM9.75 15.27V8.73L15.5 12l-5.75 3.27z"/></svg>',
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/asurwave1012?igsh=ZDBlY2NtczJ5cmMw',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
  },
];
