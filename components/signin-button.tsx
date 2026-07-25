'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { SignInModal } from './signin-modal';
import { signOutAction } from '@/lib/user-saves';

export function SignInButton({ email }: { email: string | null }) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);
  const signedIn = Boolean(email);

  useEffect(() => {
    if (!menuOpen) return;
    function handleDocClick(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleDocClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleDocClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [menuOpen]);

  function handleSignOut() {
    setMenuOpen(false);
    startTransition(async () => {
      await signOutAction();
      router.refresh();
    });
  }

  if (!signedIn) {
    return (
      <>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex min-h-11 items-center bg-accent px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-accent-foreground transition-colors hover:bg-accent-hover lg:min-h-0"
        >
          [Log in]
        </button>
        <SignInModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false);
            startTransition(() => router.refresh());
          }}
        />
      </>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-label={`Account menu for ${email}`}
        className="inline-flex min-h-11 items-center gap-1 border border-foreground px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-foreground hover:text-background lg:min-h-0"
      >
        <span>[Log in]</span>
        <span aria-hidden>{menuOpen ? '▲' : '▼'}</span>
      </button>

      {menuOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-1 w-64 border border-border bg-background"
        >
          <div className="border-b border-border px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em]">
            <p className="text-muted-foreground">Signed in as</p>
            <p className="mt-1 truncate text-foreground">{email}</p>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className="w-full px-4 py-3 text-left font-mono text-[11px] uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-border/50"
          >
            [Sign out ↗]
          </button>
        </div>
      )}
    </div>
  );
}
