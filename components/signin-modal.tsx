'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import {
  resetPasswordAction,
  signInAction,
  signUpAction,
} from '@/lib/auth-actions';

type Mode = 'signin' | 'signup' | 'reset';

export function SignInModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
      setMode('signin');
      setError(null);
      setInfo(null);
    }
    if (!open && el.open) el.close();
  }, [open]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setInfo(null);
    startTransition(async () => {
      if (mode === 'signin') {
        const result = await signInAction(email, password);
        if (result.ok) onSuccess();
        else setError(result.error);
      } else if (mode === 'signup') {
        const result = await signUpAction(email, password);
        if (result.ok) {
          setInfo('Check your inbox to confirm your email, then sign in.');
        } else setError(result.error);
      } else {
        const result = await resetPasswordAction(email);
        if (result.ok) setInfo('Reset link sent. Check your inbox.');
        else setError(result.error);
      }
    });
  }

  const title =
    mode === 'signin' ? 'Auth · Sign in' : mode === 'signup' ? 'Auth · Sign up' : 'Auth · Reset';

  const cta =
    pending
      ? mode === 'signin'
        ? 'Signing in…'
        : mode === 'signup'
          ? 'Creating…'
          : 'Sending…'
      : mode === 'signin'
        ? 'Sign in ↗'
        : mode === 'signup'
          ? 'Create account ↗'
          : 'Send reset link ↗';

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed left-1/2 top-1/2 m-0 w-[92vw] max-w-sm -translate-x-1/2 -translate-y-1/2 border border-border bg-background p-0 shadow-2xl backdrop:bg-foreground/50 backdrop:backdrop-blur-sm"
    >
      <div className="p-6">
        <header className="mb-4 flex items-center justify-between border-b border-border pb-4 font-mono text-[11px] uppercase tracking-[0.18em]">
          <h2 className="text-foreground">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="px-2 py-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            [×]
          </button>
        </header>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Email
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              disabled={pending}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              aria-label="Email address"
              className="h-11 w-full border border-border bg-card px-3 font-mono text-base text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none disabled:opacity-60 sm:text-sm"
            />
          </div>
          {mode !== 'reset' && (
            <div>
              <label className="mb-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Password · min 8 characters
              </label>
              <input
                type="password"
                required
                minLength={8}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                disabled={pending}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                aria-label="Password"
                className="h-11 w-full border border-border bg-card px-3 font-mono text-base text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none disabled:opacity-60 sm:text-sm"
              />
            </div>
          )}
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-11 w-full items-center justify-center bg-accent px-5 font-mono text-sm uppercase tracking-[0.18em] text-accent-foreground transition-colors hover:bg-accent-hover disabled:opacity-60"
          >
            {cta}
          </button>

          {info && (
            <p
              role="status"
              className="border border-success bg-success/10 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.15em] text-success"
            >
              [ {info} ]
            </p>
          )}
          {error && (
            <p
              role="alert"
              className="font-mono text-[11px] uppercase tracking-[0.15em] text-accent-hover"
            >
              [ Error ] {error}
            </p>
          )}
        </form>

        <div className="mt-5 flex flex-col gap-2 border-t border-border pt-4 text-center font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
          {mode === 'signin' && (
            <>
              <button
                type="button"
                onClick={() => setMode('reset')}
                className="transition-colors hover:text-foreground"
              >
                [Forgot password?]
              </button>
              <span>
                No account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-foreground transition-colors hover:text-accent"
                >
                  [Sign up]
                </button>
              </span>
            </>
          )}
          {mode === 'signup' && (
            <span>
              Have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-foreground transition-colors hover:text-accent"
              >
                [Sign in]
              </button>
            </span>
          )}
          {mode === 'reset' && (
            <button
              type="button"
              onClick={() => setMode('signin')}
              className="text-foreground transition-colors hover:text-accent"
            >
              [Back to sign in]
            </button>
          )}
        </div>
      </div>
    </dialog>
  );
}
