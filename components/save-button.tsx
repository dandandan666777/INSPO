'use client';

import { useState, useTransition, type MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { SignInModal } from './signin-modal';
import { saveItemAction, unsaveItemAction } from '@/lib/user-saves';

export function SaveButton({
  itemId,
  initialSaved,
  signedIn,
}: {
  itemId: number;
  initialSaved: boolean;
  signedIn: boolean;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [modalOpen, setModalOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function performToggle(nextSaved: boolean) {
    setSaved(nextSaved);
    startTransition(async () => {
      const result = nextSaved
        ? await saveItemAction(itemId)
        : await unsaveItemAction(itemId);
      if (!result.ok) setSaved(!nextSaved);
    });
  }

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (!signedIn) {
      setModalOpen(true);
      return;
    }
    performToggle(!saved);
  }

  function handleSignedIn() {
    setModalOpen(false);
    setSaved(true);
    startTransition(async () => {
      const result = await saveItemAction(itemId);
      if (!result.ok) {
        setSaved(false);
        return;
      }
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        aria-label={saved ? 'Remove from library' : 'Save to library'}
        className="absolute right-2 top-2 z-10 border border-border bg-background px-3 py-2 font-mono text-[11px] uppercase tracking-[0.15em] text-foreground shadow-sm transition-all hover:border-foreground focus-visible:opacity-100 data-[saved=true]:opacity-100 data-[saved=true]:border-accent data-[saved=true]:bg-accent data-[saved=true]:text-accent-foreground disabled:cursor-wait lg:px-2 lg:py-1 lg:text-[10px] lg:opacity-0 lg:group-hover:opacity-100"
        data-saved={saved}
      >
        {saved ? '[Saved]' : '[Save +]'}
      </button>
      <SignInModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSignedIn}
      />
    </>
  );
}
