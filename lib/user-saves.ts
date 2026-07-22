'use server';

import { createSupabaseServerClient } from './supabase-server';

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function getCurrentUserEmail(): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user?.email ?? null;
}

export async function getSavedItemIds(): Promise<number[]> {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return [];
  const { data, error } = await supabase.from('user_saves').select('item_id');
  if (error) return [];
  return (data ?? []).map((row) => row.item_id as number);
}

export async function saveItemAction(itemId: number): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { ok: false, error: 'Sign in first.' };

  const { error } = await supabase
    .from('user_saves')
    .upsert(
      { user_id: userData.user.id, item_id: itemId },
      { onConflict: 'user_id,item_id' },
    );
  if (error) {
    console.error('save failed:', error);
    return { ok: false, error: 'Save failed.' };
  }
  return { ok: true };
}

export async function unsaveItemAction(itemId: number): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { ok: false, error: 'Sign in first.' };

  const { error } = await supabase
    .from('user_saves')
    .delete()
    .eq('user_id', userData.user.id)
    .eq('item_id', itemId);
  if (error) {
    console.error('unsave failed:', error);
    return { ok: false, error: 'Unsave failed.' };
  }
  return { ok: true };
}

export async function signOutAction(): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  return { ok: true };
}
