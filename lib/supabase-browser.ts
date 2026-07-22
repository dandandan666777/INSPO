'use client';

import { createBrowserClient } from '@supabase/ssr';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Environment variable ${name} is not set`);
  return value;
}

let cached: ReturnType<typeof createBrowserClient> | null = null;

export function supabaseBrowser() {
  if (cached) return cached;
  cached = createBrowserClient(
    required('NEXT_PUBLIC_SUPABASE_URL'),
    required('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'),
  );
  return cached;
}
