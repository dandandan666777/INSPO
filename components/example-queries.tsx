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
      <p className="text-sm text-muted-foreground sm:text-base">
        Search product design by material, finish, and form — not tags.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Try:</span>
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => router.push(`/explore?q=${encodeURIComponent(example)}`)}
            className="rounded-full border-none bg-border/60 px-3.5 py-1.5 text-sm text-foreground transition-colors hover:bg-border"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
