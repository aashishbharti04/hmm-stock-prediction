import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { ContactForm } from '@/components/contact/ContactForm';
import { CONTACT_EMAIL, SOCIAL_LINKS, REPO_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch about the Hidden Markov Model and Future Prediction of Stock Market project — questions, feedback, collaboration, or contributions.',
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="Contact"
        title="Get in touch"
        description="Questions, feedback, collaboration ideas, or bug reports — we'd love to hear from you."
      />

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Form */}
        <Card className="lg:col-span-3">
          <CardHeader
            title="Send a message"
            description="Fill this out and we'll open a pre-filled email in your mail app."
          />
          <CardBody>
            <ContactForm />
          </CardBody>
        </Card>

        {/* Details */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Reach us directly" />
            <CardBody className="space-y-4">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="flex items-center gap-3 text-sm transition-colors hover:text-primary"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-10 6L2 7" />
                  </svg>
                </span>
                <span className="min-w-0">
                  <span className="block text-xs text-muted-foreground">Email</span>
                  <span className="block truncate font-medium">{CONTACT_EMAIL}</span>
                </span>
              </a>

              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm transition-colors hover:text-primary"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.48l-.01-1.7c-2.78.62-3.37-1.37-3.37-1.37-.46-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.36 1.12 2.94.86.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05a9.4 9.4 0 0 1 5 0c1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9l-.01 2.82c0 .27.18.59.69.48A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2z" />
                  </svg>
                </span>
                <span className="min-w-0">
                  <span className="block text-xs text-muted-foreground">GitHub</span>
                  <span className="block truncate font-medium">Open an issue or PR</span>
                </span>
              </a>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Connect" />
            <CardBody>
              <ul className="flex flex-wrap gap-2">
                {SOCIAL_LINKS.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.label}
                      title={link.label}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      <span dangerouslySetInnerHTML={{ __html: link.icon }} />
                    </a>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
