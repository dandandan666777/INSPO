'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords don’t match.');
      return;
    }
    startTransition(async () => {
      const supabase = supabaseBrowser();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        return;
      }
      router.push('/explore');
    });
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        type="password"
        required
        autoComplete="new-password"
        placeholder="New password"
        value={password}
        disabled={pending}
        onChange={(e) => setPassword(e.target.value)}
        className="h-11 w-full rounded-full border-none bg-border/60 px-5 text-base text-foreground placeholder:text-muted-foreground focus:bg-border focus:outline-none disabled:opacity-60"
      />
      <input
        type="password"
        required
        autoComplete="new-password"
        placeholder="Confirm new password"
        value={confirm}
        disabled={pending}
        onChange={(e) => setConfirm(e.target.value)}
        className="h-11 w-full rounded-full border-none bg-border/60 px-5 text-base text-foreground placeholder:text-muted-foreground focus:bg-border focus:outline-none disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 w-full items-center justify-center rounded-full bg-accent px-5 text-base font-medium text-accent-foreground transition-colors hover:bg-accent-hover disabled:opacity-60"
      >
        {pending ? 'Saving…' : 'Save new password'}
      </button>
      {error && (
        <p role="alert" className="text-sm text-accent-hover">
          {error}
        </p>
      )}
    </form>
  );
}
