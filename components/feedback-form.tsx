'use client';

import { useState, useTransition } from 'react';
import { submitFeedbackAction } from '@/lib/feedback';
import { SignInModal } from './signin-modal';

export function FeedbackForm({ signedIn }: { signedIn: boolean }) {
  const [body, setBody] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function performSubmit() {
    startTransition(async () => {
      const result = await submitFeedbackAction(body);
      if (result.ok) {
        setSuccess(true);
        setBody('');
      } else {
        setError(result.error);
      }
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (body.trim().length < 3) {
      setError('Please write a little more.');
      return;
    }
    if (!signedIn) {
      setModalOpen(true);
      return;
    }
    performSubmit();
  }

  function handleSignedIn() {
    setModalOpen(false);
    setError(null);
    performSubmit();
  }

  if (success) {
    return (
      <div className="mt-8 flex flex-col items-center gap-4">
        <p
          role="status"
          className="inline-block border border-success bg-success/10 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-success"
        >
          [ Thanks. We&rsquo;ve got it. ]
        </p>
        <button
          type="button"
          onClick={() => {
            setSuccess(false);
            setError(null);
          }}
          className="border border-foreground px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-foreground hover:text-background"
        >
          [Send more feedback]
        </button>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 text-left">
        <textarea
          required
          minLength={3}
          maxLength={4000}
          disabled={pending}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Source you'd love to see. Feature request. Bug. Gripe. Anything."
          aria-label="Feedback"
          rows={4}
          className="w-full border border-border bg-card px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none disabled:opacity-60"
        />
        <div className="flex items-center justify-between gap-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {signedIn ? 'Signed in · Will follow up by email' : 'Sign in required to send'}
          </span>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-11 items-center justify-center bg-accent px-6 font-mono text-sm uppercase tracking-[0.18em] text-accent-foreground transition-colors hover:bg-accent-hover disabled:opacity-60"
          >
            {pending ? 'Sending…' : 'Send ↗'}
          </button>
        </div>
        {error && (
          <p
            role="alert"
            className="font-mono text-[11px] uppercase tracking-[0.15em] text-accent-hover"
          >
            [ Error ] {error}
          </p>
        )}
      </form>
      <SignInModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSignedIn}
      />
    </>
  );
}
