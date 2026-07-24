'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { saveItemAction, unsaveItemAction } from '@/lib/user-saves';
import { SignInModal } from './signin-modal';

export function DetailSaveButton({
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

  function handleClick() {
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
        className={`inline-flex min-h-11 items-center gap-2 border px-5 py-2.5 font-mono text-sm uppercase tracking-[0.18em] transition-colors disabled:cursor-wait disabled:opacity-60 ${
          saved
            ? 'border-accent bg-accent text-accent-foreground hover:bg-accent-hover'
            : 'border-foreground text-foreground hover:bg-foreground hover:text-background'
        }`}
      >
        {saved ? '[Saved ✓]' : '[Save to library +]'}
      </button>
      <SignInModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSignedIn}
      />
    </>
  );
}
