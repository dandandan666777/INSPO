'use client';

import { Bookmark } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition, type MouseEvent } from 'react';
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
      if (!result.ok) {
        setSaved(!nextSaved);
      }
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
        aria-label={saved ? 'Remove from saved' : 'Save image'}
        className="absolute right-2 top-2 z-10 rounded-full bg-background/85 p-2 text-foreground opacity-0 shadow-sm backdrop-blur transition-all hover:bg-background group-hover:opacity-100 focus-visible:opacity-100 data-[saved=true]:opacity-100 disabled:cursor-wait"
        data-saved={saved}
      >
        <Bookmark
          className="h-4 w-4"
          fill={saved ? 'currentColor' : 'none'}
          color={saved ? 'var(--accent)' : 'currentColor'}
        />
      </button>
      <SignInModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSignedIn}
      />
    </>
  );
}
