import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Environment variable ${name} is not set`);
  return value;
}

// Server-side Supabase client that speaks to auth via cookies (via
// @supabase/ssr). Use this whenever code needs to know the current user
// or write on their behalf under RLS. Admin-scoped bypass-RLS operations
// keep going through supabaseAdmin() in lib/supabase.ts.
export async function createSupabaseServerClient() {
  const store = await cookies();

  return createServerClient(
    required('SUPABASE_URL'),
    required('SUPABASE_PUBLISHABLE_KEY'),
    {
      cookies: {
        getAll() {
          return store.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              store.set({ name, value, ...(options ?? {}) });
            }
          } catch {
            // Called from a Server Component. Middleware refreshes sessions.
          }
        },
      },
    },
  );
}
