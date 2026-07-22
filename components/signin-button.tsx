'use client';

import { ChevronDown, LogOut, UserRound } from 'lucide-react';
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
          className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
        >
          <UserRound className="h-4 w-4" aria-hidden />
          Sign in
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
        className="inline-flex items-center gap-1.5 rounded-full bg-border/60 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-border"
      >
        <UserRound className="h-4 w-4" aria-hidden />
        <span className="hidden max-w-[10rem] truncate sm:inline">{email}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${menuOpen ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {menuOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-border/60 bg-background shadow-lg"
        >
          <div className="border-b border-border/60 px-4 py-3">
            <p className="text-xs text-muted-foreground">Signed in as</p>
            <p className="mt-0.5 truncate text-sm font-medium text-foreground">{email}</p>
          </div>
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-border/60"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
