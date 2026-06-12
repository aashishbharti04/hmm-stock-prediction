'use client';

import { useState } from 'react';
import { CONTACT_EMAIL } from '@/lib/site';

const fieldClass =
  'w-full rounded-md border border-input bg-card px-3 py-2.5 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-ring';
const labelClass = 'mb-1.5 block text-xs font-medium text-muted-foreground';

/**
 * Accessible contact form. With no mail backend, submitting composes a prefilled
 * email via the user's mail client (mailto:) — a dependency-free, privacy-friendly
 * way to reach out. Inputs are validated before composing.
 */
export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!name.trim() || !message.trim()) {
      setError('Please enter your name and a message.');
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    const href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      subject || `Message from ${name}`,
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
    setSent(true);
  }

  if (sent) {
    return (
      <div
        role="status"
        className="flex flex-col items-center rounded-lg border border-bullish/30 bg-bullish/5 px-6 py-12 text-center"
      >
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-bullish/15 text-bullish">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h3 className="text-base font-semibold">Your email is ready to send</h3>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          We&apos;ve opened your mail app with the message pre-filled. If nothing happened,
          email us directly at{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-primary hover:underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-5 text-sm font-medium text-primary hover:underline"
        >
          Write another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>
            Name <span className="text-bearish">*</span>
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={fieldClass}
            autoComplete="name"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldClass}
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className={labelClass}>
          Subject
        </label>
        <input
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>
          Message <span className="text-bearish">*</span>
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`${fieldClass} min-h-32 resize-y`}
          rows={5}
          required
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-bearish">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
      >
        Send message
      </button>
    </form>
  );
}
