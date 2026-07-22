'use client';

import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
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
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  useEffect(() => {
    if (open) {
      setMode('signin');
      setEmail('');
      setPassword('');
      setError(null);
      setInfo(null);
    }
  }, [open]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setInfo(null);
    startTransition(async () => {
      if (mode === 'signin') {
        const result = await signInAction(email, password);
        if (result.ok) {
          onSuccess();
          router.refresh();
        } else setError(result.error);
      } else if (mode === 'signup') {
        const result = await signUpAction(email, password);
        if (result.ok) {
          setInfo(
            'Check your inbox to confirm your email, then sign in. You can close this window.',
          );
        } else setError(result.error);
      } else {
        const result = await resetPasswordAction(email);
        if (result.ok) {
          setInfo('Reset link sent. Check your inbox.');
        } else setError(result.error);
      }
    });
  }

  const title =
    mode === 'signin'
      ? 'Sign in to save'
      : mode === 'signup'
        ? 'Create an account'
        : 'Reset your password';

  const cta =
    pending && mode === 'signin'
      ? 'Signing in…'
      : pending && mode === 'signup'
        ? 'Creating…'
        : pending && mode === 'reset'
          ? 'Sending…'
          : mode === 'signin'
            ? 'Sign in'
            : mode === 'signup'
              ? 'Create account'
              : 'Send reset link';

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      className="fixed left-1/2 top-1/2 m-0 w-[92vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-background p-0 shadow-2xl backdrop:bg-foreground/40 backdrop:backdrop-blur-sm"
    >
      <div className="p-6">
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-border hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <form onSubmit={submit} className="space-y-3">
          <input
            type="email"
            required
            autoFocus
            autoComplete="email"
            disabled={pending}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-label="Email address"
            className="h-11 w-full rounded-full border-none bg-border/60 px-5 text-base text-foreground placeholder:text-muted-foreground focus:bg-border focus:outline-none disabled:opacity-60"
          />
          {mode !== 'reset' && (
            <input
              type="password"
              required
              minLength={8}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              disabled={pending}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 8 characters)"
              aria-label="Password"
              className="h-11 w-full rounded-full border-none bg-border/60 px-5 text-base text-foreground placeholder:text-muted-foreground focus:bg-border focus:outline-none disabled:opacity-60"
            />
          )}
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-11 w-full items-center justify-center rounded-full bg-accent px-5 text-base font-medium text-accent-foreground transition-colors hover:bg-accent-hover disabled:opacity-60"
          >
            {cta}
          </button>

          {info && (
            <p role="status" className="rounded-2xl bg-success/15 px-4 py-2 text-sm text-success">
              {info}
            </p>
          )}
          {error && (
            <p role="alert" className="text-sm text-accent-hover">
              {error}
            </p>
          )}
        </form>

        <div className="mt-5 flex flex-col gap-2 text-center text-sm text-muted-foreground">
          {mode === 'signin' && (
            <>
              <button
                type="button"
                onClick={() => setMode('reset')}
                className="hover:text-accent"
              >
                Forgot password?
              </button>
              <span>
                No account yet?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="font-medium text-foreground hover:text-accent"
                >
                  Sign up
                </button>
              </span>
            </>
          )}
          {mode === 'signup' && (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="font-medium text-foreground hover:text-accent"
              >
                Sign in
              </button>
            </span>
          )}
          {mode === 'reset' && (
            <button
              type="button"
              onClick={() => setMode('signin')}
              className="font-medium text-foreground hover:text-accent"
            >
              Back to sign in
            </button>
          )}
        </div>
      </div>
    </dialog>
  );
}
