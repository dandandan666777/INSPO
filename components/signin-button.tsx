'use client';

import { UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { SignInModal } from './signin-modal';
import { signOutAction } from '@/lib/user-saves';

export function SignInButton({ email }: { email: string | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const signedIn = Boolean(email);

  function handleSignOut() {
    startTransition(async () => {
      await signOutAction();
      router.refresh();
    });
  }

  return (
    <>
      {signedIn ? (
        <button
          type="button"
          onClick={handleSignOut}
          title={`Signed in as ${email}. Click to sign out.`}
          className="inline-flex items-center gap-1.5 rounded-full bg-border/60 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-border"
        >
          <UserRound className="h-4 w-4" aria-hidden />
          <span className="hidden max-w-[10rem] truncate sm:inline">{email}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
        >
          <UserRound className="h-4 w-4" aria-hidden />
          Sign in
        </button>
      )}
      <SignInModal
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={() => {
          setOpen(false);
          router.refresh();
        }}
      />
    </>
  );
}
