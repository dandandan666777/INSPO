import { embedImage } from '../lib/embeddings';
import { supabaseAdmin } from '../lib/supabase';

const CONCURRENCY = 1;
const PROGRESS_EVERY = 10;

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Environment variable ${name} is not set`);
  return value;
}

type Item = { id: number; image_r2_key: string };

type ProcessResult = { id: number; ok: boolean; error?: string };

async function main() {
  const supabase = supabaseAdmin();
  const publicUrl = required('R2_PUBLIC_URL');

  const limitArg = process.argv[2];
  let limit: number | null = null;
  if (limitArg !== undefined) {
    const parsed = Number.parseInt(limitArg, 10);
    if (Number.isNaN(parsed) || parsed <= 0) {
      console.error(`Invalid limit: ${limitArg}`);
      process.exit(1);
    }
    limit = parsed;
  }

  const base = supabase
    .from('items')
    .select('id, image_r2_key')
    .not('image_r2_key', 'is', null)
    .is('embedding', null)
    .order('id', { ascending: true });

  const { data, error } = limit === null ? await base : await base.limit(limit);
  if (error) {
    console.error('Failed to load items:', error.message);
    process.exit(1);
  }

  const items = (data ?? []) as Item[];
  if (items.length === 0) {
    console.log('No items need embedding.');
    return;
  }

  console.log(`Embedding ${items.length} items (concurrency ${CONCURRENCY})...`);

  let done = 0;
  let failed = 0;
  let lastProgressAt = 0;

  for (let i = 0; i < items.length; i += CONCURRENCY) {
    const chunk = items.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      chunk.map(async (item): Promise<ProcessResult> => {
        try {
          const imageUrl = `${publicUrl}/${item.image_r2_key}`;
          const vector = await embedImage(imageUrl);
          const vectorLiteral = `[${vector.join(',')}]`;
          const { error: updateError } = await supabase
            .from('items')
            .update({ embedding: vectorLiteral })
            .eq('id', item.id);
          if (updateError) throw new Error(updateError.message);
          return { id: item.id, ok: true };
        } catch (err) {
          return { id: item.id, ok: false, error: (err as Error).message };
        }
      }),
    );

    for (const result of results) {
      done++;
      if (!result.ok) {
        failed++;
        console.error(`  #${result.id} failed: ${result.error ?? 'unknown'}`);
      }
    }

    if (done - lastProgressAt >= PROGRESS_EVERY || done === items.length) {
      console.log(`  progress: ${done}/${items.length} (${failed} failed)`);
      lastProgressAt = done;
    }
  }

  console.log(`\nDone. Embedded ${done - failed} items. ${failed} failure${failed === 1 ? '' : 's'}.`);
  if (failed === items.length) process.exit(1);
}

main().catch((err: unknown) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
