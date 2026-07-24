'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export function SearchInput() {
  const router = useRouter();
  const params = useSearchParams();
  const currentQuery = params.get('q') ?? '';
  const [value, setValue] = useState(currentQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue(currentQuery);
  }, [currentQuery]);

  useEffect(() => {
    if (!currentQuery) inputRef.current?.focus();
  }, [currentQuery]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = value.trim();
    router.push(trimmed ? `/explore?q=${encodeURIComponent(trimmed)}` : '/explore');
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
      <span
        aria-hidden
        className="pointer-events-none font-mono text-sm text-accent"
      >
        {'>'}
      </span>
      <input
        ref={inputRef}
        type="search"
        name="q"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="search product design…"
        aria-label="Search product design inspiration"
        className="h-11 w-full border border-border bg-card px-3 font-mono text-base text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none sm:h-10 sm:text-sm"
      />
    </form>
  );
}
