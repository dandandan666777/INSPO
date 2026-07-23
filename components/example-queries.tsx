'use client';

import { useRouter } from 'next/navigation';

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
  return (
    <div className="mb-8 space-y-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        Query · material · finish · form
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Try:
        </span>
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => router.push(`/explore?q=${encodeURIComponent(example)}`)}
            className="border border-border bg-card px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-foreground transition-colors hover:border-foreground"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
