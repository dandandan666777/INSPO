'use client';

import { Bookmark } from 'lucide-react';
import { useEffect, useState, type MouseEvent } from 'react';

const COOKIE_NAME = 'inspo-saved';
const ONE_YEAR = 60 * 60 * 24 * 365;

function readSavedIds(): number[] {
  if (typeof document === 'undefined') return [];
  const match = document.cookie.split('; ').find((row) => row.startsWith(`${COOKIE_NAME}=`));
  if (!match) return [];
  const value = decodeURIComponent(match.split('=')[1] ?? '');
  if (!value) return [];
  return value
    .split(',')
    .map((chunk) => Number.parseInt(chunk, 10))
    .filter((n) => Number.isFinite(n));
}

function writeSavedIds(ids: number[]) {
  const value = encodeURIComponent(ids.join(','));
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
}

export function SaveButton({ itemId }: { itemId: number }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(readSavedIds().includes(itemId));
  }, [itemId]);

  function toggle(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    const current = readSavedIds();
    const next = current.includes(itemId)
      ? current.filter((id) => id !== itemId)
      : [...current, itemId];
    writeSavedIds(next);
    setSaved(next.includes(itemId));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={saved ? 'Remove from saved' : 'Save image'}
      className="absolute right-2 top-2 z-10 rounded-full bg-background/85 p-2 text-foreground opacity-0 shadow-sm backdrop-blur transition-all hover:bg-background group-hover:opacity-100 focus-visible:opacity-100 data-[saved=true]:opacity-100"
      data-saved={saved}
    >
      <Bookmark
        className="h-4 w-4"
        fill={saved ? 'currentColor' : 'none'}
        color={saved ? 'var(--accent)' : 'currentColor'}
      />
    </button>
  );
}
