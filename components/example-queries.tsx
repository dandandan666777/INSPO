'use client';

import { useRouter } from 'next/navigation';

const EXAMPLES = [
  'waterproof buttons',
  'matte black finish',
  'rounded product corners',
  'aluminum enclosure',
  'soft-touch grip',
];

export function ExampleQueries() {
  const router = useRouter();
  return (
    <div className="mb-8 flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">Try:</span>
      {EXAMPLES.map((example) => (
        <button
          key={example}
          type="button"
          onClick={() => router.push(`/?q=${encodeURIComponent(example)}`)}
          className="rounded-full border border-border bg-card px-3 py-1 text-sm text-foreground transition-colors hover:border-accent hover:text-accent"
        >
          {example}
        </button>
      ))}
    </div>
  );
}
