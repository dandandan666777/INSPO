'use client';

import { X } from 'lucide-react';
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
        className="rounded-full bg-border/60 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-border sm:text-sm"
      >
        View sources
      </button>
      <dialog
        ref={dialogRef}
        onClick={(event) => {
          if (event.target === dialogRef.current) close();
        }}
        className="w-[92vw] max-w-md rounded-3xl bg-background p-0 shadow-2xl backdrop:bg-foreground/40 backdrop:backdrop-blur-sm"
      >
        <div className="p-6">
          <header className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Sources</h2>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-border hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </header>
          <p className="mb-5 text-sm text-muted-foreground">
            INSPO aggregates from these editorial product-design publications. Click any source to
            visit its homepage.
          </p>
          <ul className="space-y-2">
            {sources.map((source) => (
              <li key={source.id}>
                <a
                  href={source.homepage_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-2xl bg-border/40 p-3 transition-colors hover:bg-border"
                >
                  <div className="font-medium text-foreground">{source.name}</div>
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
