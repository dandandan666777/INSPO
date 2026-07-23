'use client';

import { useActionState } from 'react';
import { signUpAction, type SignupState } from '@/lib/signup';

const initialState: SignupState = { status: 'idle' };

export function EmailSignup() {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);
  const success = state.status === 'success';

  return (
    <section className="border-t border-border bg-background">
      <div className="mx-auto max-w-2xl px-6 py-20 text-center sm:py-24">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Feedback · Requests
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Got something you want to see? Or any feedback.
        </h2>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          Drop your email — we&rsquo;ll follow up. Source ideas, feature requests, gripes,
          anything.
        </p>

        {success ? (
          <p
            role="status"
            className="mt-8 inline-block border border-success bg-success/10 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-success"
          >
            [ Thanks. We&rsquo;ll be in touch. ]
          </p>
        ) : (
          <form action={formAction} className="mt-8 flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              name="email"
              required
              aria-label="Email address"
              placeholder="you@example.com"
              disabled={pending}
              className="h-11 flex-1 border border-border bg-card px-4 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-11 items-center justify-center bg-accent px-6 font-mono text-sm uppercase tracking-[0.18em] text-accent-foreground transition-colors hover:bg-accent-hover disabled:opacity-60"
            >
              {pending ? 'Sending…' : 'Send ↗'}
            </button>
          </form>
        )}

        {state.error && !success && (
          <p
            role="alert"
            className="mt-4 font-mono text-[11px] uppercase tracking-[0.15em] text-accent-hover"
          >
            [ Error ] {state.error}
          </p>
        )}
      </div>
    </section>
  );
}
