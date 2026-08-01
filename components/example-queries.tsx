'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

const EXAMPLES = [
  'matte black finish',
  'brushed aluminum',
  'warm oak grain',
  'terracotta ceramic',
  'soft-touch grip',
  'rounded product corners',
];

export function ExampleQueries() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [activeQuery, setActiveQuery] = useState<string | null>(null);

  function handleClick(example: string) {
    setActiveQuery(example);
    startTransition(() => {
      router.push(`/explore?q=${encodeURIComponent(example)}`);
    });
  }

  return (
    <div className="mb-8 space-y-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        Query · material · finish · form
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Try:
        </span>
        {EXAMPLES.map((example) => {
          const isActive = pending && activeQuery === example;
          return (
            <button
              key={example}
              type="button"
              disabled={pending}
              onClick={() => handleClick(example)}
              className="inline-flex min-h-11 items-center gap-2 border border-border bg-card px-3 py-2 font-mono text-[11px] uppercase tracking-[0.15em] text-foreground transition-colors hover:border-foreground disabled:cursor-wait lg:min-h-0 lg:py-1.5"
            >
              {isActive && (
                <span aria-hidden className="inline-flex gap-0.5 text-accent">
                  <span className="animate-[pulse_1.4s_ease-in-out_infinite]">·</span>
                  <span className="animate-[pulse_1.4s_ease-in-out_0.2s_infinite]">·</span>
                  <span className="animate-[pulse_1.4s_ease-in-out_0.4s_infinite]">·</span>
                </span>
              )}
              <span className={isActive ? 'opacity-80' : ''}>{example}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
