'use client';

import { Search } from 'lucide-react';
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
    router.push(trimmed ? `/?q=${encodeURIComponent(trimmed)}` : '/');
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Search
        className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <input
        ref={inputRef}
        type="search"
        name="q"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search product design inspiration…"
        aria-label="Search product design inspiration"
        className="h-12 w-full rounded-full border border-border bg-card pl-12 pr-5 text-base text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
      />
    </form>
  );
}
