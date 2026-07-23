'use server';

import { createSupabaseServerClient } from './supabase-server';

export type FeedbackResult = { ok: true } | { ok: false; error: string };

export async function submitFeedbackAction(body: string): Promise<FeedbackResult> {
  const trimmed = body.trim();
  if (trimmed.length < 3) {
    return { ok: false, error: 'Please write a little more.' };
  }
  if (trimmed.length > 4000) {
    return { ok: false, error: 'Please keep it under 4000 characters.' };
  }

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { ok: false, error: 'Sign in first.' };

  const { error } = await supabase
    .from('feedback')
    .insert({ user_id: userData.user.id, body: trimmed });
  if (error) {
    console.error('feedback insert failed:', error);
    return { ok: false, error: 'Something went wrong. Try again.' };
  }
  return { ok: true };
}
