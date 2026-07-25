'use client';

import { useRouter } from 'next/navigation';

export function BackLink({ fallback }: { fallback: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
          router.back();
        } else {
          router.push(fallback);
        }
      }}
      className="mb-6 inline-flex min-h-11 items-center gap-1 border border-border bg-card px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-foreground hover:text-background lg:min-h-0"
    >
      [← Back]
    </button>
  );
}
