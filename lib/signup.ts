'use server';

import { supabaseAdmin } from './supabase';

export type SignupState = { status: 'idle' | 'success'; error?: string };

export async function signUpAction(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const raw = formData.get('email');
  if (typeof raw !== 'string') return { status: 'idle', error: 'Please enter an email.' };
  const email = raw.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: 'idle', error: 'That doesn’t look like a valid email.' };
  }

  const supabase = supabaseAdmin();
  const { error } = await supabase.from('signups').insert({ email });

  // 23505 = unique_violation. Already-subscribed is the same user-facing
  // outcome as a fresh subscribe, so surface success either way.
  if (error && error.code !== '23505') {
    console.error('Signup failed:', error);
    return { status: 'idle', error: 'Something went wrong. Try again in a moment.' };
  }

  return { status: 'success' };
}
