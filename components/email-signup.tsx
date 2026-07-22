'use client';

import { ArrowRight } from 'lucide-react';
import { useActionState } from 'react';
import { signUpAction, type SignupState } from '@/lib/signup';

const initialState: SignupState = { status: 'idle' };

export function EmailSignup() {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);
  const success = state.status === 'success';

  return (
    <section className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-2xl px-6 py-20 text-center sm:py-24">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Stay up to date with the latest innovation
        </h2>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          Handpicked product-design finds delivered occasionally. No spam.
        </p>

        {success ? (
          <p
            role="status"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-success/15 px-5 py-2.5 text-sm font-medium text-success"
          >
            Thanks — you’re on the list.
          </p>
        ) : (
          <form action={formAction} className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-2">
            <input
              type="email"
              name="email"
              required
              aria-label="Email address"
              placeholder="you@example.com"
              disabled={pending}
              className="h-12 flex-1 rounded-full border-none bg-border/60 px-5 text-base text-foreground placeholder:text-muted-foreground focus:bg-border focus:outline-none disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 text-base font-medium text-accent-foreground transition-colors hover:bg-accent-hover disabled:opacity-60"
            >
              {pending ? 'Adding…' : 'Subscribe'}
              {!pending && <ArrowRight className="h-4 w-4" aria-hidden />}
            </button>
          </form>
        )}

        {state.error && !success && (
          <p role="alert" className="mt-4 text-sm text-accent-hover">
            {state.error}
          </p>
        )}
      </div>
    </section>
  );
}
