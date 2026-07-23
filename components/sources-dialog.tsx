'use client';

import { useRef } from 'react';
import type { SourceRow } from '@/lib/search';

export function SourcesDialog({ sources }: { sources: SourceRow[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  function open() {
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="border border-foreground px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-foreground hover:text-background"
      >
        [View sources]
      </button>
      <dialog
        ref={dialogRef}
        onClick={(event) => {
          const el = dialogRef.current;
          if (!el || event.target !== el) return;
          const rect = el.getBoundingClientRect();
          const inside =
            event.clientX >= rect.left &&
            event.clientX <= rect.right &&
            event.clientY >= rect.top &&
            event.clientY <= rect.bottom;
          if (!inside) close();
        }}
        className="fixed left-1/2 top-1/2 m-0 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 border border-border bg-background p-0 shadow-2xl backdrop:bg-foreground/50 backdrop:backdrop-blur-sm"
      >
        <div className="p-6">
          <header className="mb-4 flex items-center justify-between border-b border-border pb-4 font-mono text-[11px] uppercase tracking-[0.18em]">
            <h2 className="text-foreground">Sources · {sources.length}</h2>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="px-2 py-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              [×]
            </button>
          </header>
          <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
            Editorial · product-design publications
          </p>
          <ul className="divide-y divide-border border border-border">
            {sources.map((source) => (
              <li key={source.id}>
                <a
                  href={source.homepage_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-card p-3 transition-colors hover:bg-border/40"
                >
                  <div className="font-mono text-[13px] font-semibold uppercase tracking-[0.1em] text-foreground">
                    {source.name}
                  </div>
                  <div className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">
                    {source.feed_url}
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </dialog>
    </>
  );
}
