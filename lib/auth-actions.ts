'use server';

import { headers } from 'next/headers';
import { isValidRole } from './roles';
import { createSupabaseServerClient } from './supabase-server';

export type AuthResult = { ok: true } | { ok: false; error: string };

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

async function siteOrigin(): Promise<string> {
  const headerStore = await headers();
  const proto = headerStore.get('x-forwarded-proto') ?? 'http';
  const host = headerStore.get('host') ?? 'localhost:3000';
  return `${proto}://${host}`;
}

export async function signInAction(
  emailRaw: string,
  password: string,
): Promise<AuthResult> {
  const email = normalizeEmail(emailRaw);
  if (!EMAIL_RX.test(email)) return { ok: false, error: 'That email doesn’t look right.' };
  if (password.length < 8) return { ok: false, error: 'Password must be at least 8 characters.' };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function signUpAction(
  emailRaw: string,
  password: string,
  role: string,
): Promise<AuthResult> {
  const email = normalizeEmail(emailRaw);
  if (!EMAIL_RX.test(email)) return { ok: false, error: 'That email doesn’t look right.' };
  if (password.length < 8) return { ok: false, error: 'Password must be at least 8 characters.' };
  if (!isValidRole(role)) return { ok: false, error: 'Please choose a role from the list.' };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${await siteOrigin()}/auth/callback`,
      data: { role },
    },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function resetPasswordAction(emailRaw: string): Promise<AuthResult> {
  const email = normalizeEmail(emailRaw);
  if (!EMAIL_RX.test(email)) return { ok: false, error: 'That email doesn’t look right.' };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${await siteOrigin()}/auth/reset-password`,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
