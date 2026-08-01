import { embedText } from '../lib/embeddings';
import { supabaseAdmin } from '../lib/supabase';

// Broader negative than the previous "video game screenshot" — targets the
// editorial-magazine noise (people/portraits, architectural interiors,
// CGI/fantasy artwork) that was still leaking through. The 2026-08 pass
// deleted 6 items in these categories manually; this prompt is what would
// have caught them at scoring time.
//
// Kept as a SINGLE negative because migration 0010's 4-negative experiment
// tanked precision by hiding real product shots with people or text. If this
// prompt itself proves too aggressive, tighten it (e.g. drop "or a person")
// and rerun.
const POSITIVE_PROMPT = 'a professional product design photograph on a clean background';
const NEGATIVE_PROMPT =
  'an editorial photograph of a person, an architectural interior, or a stylized digital illustration';

async function main() {
  console.log(`Embedding reference prompts…`);
  console.log(`  positive: "${POSITIVE_PROMPT}"`);
  console.log(`  negative: "${NEGATIVE_PROMPT}"`);
  const [positive, negative] = await Promise.all([
    embedText(POSITIVE_PROMPT),
    embedText(NEGATIVE_PROMPT),
  ]);

  const positiveLiteral = `[${positive.join(',')}]`;
  const negativeLiteral = `[${negative.join(',')}]`;

  const supabase = supabaseAdmin();
  console.log('Scoring all items via score_all_items RPC…');
  const { data, error } = await supabase.rpc('score_all_items', {
    positive_embedding: positiveLiteral,
    negative_embedding: negativeLiteral,
  });
  if (error) {
    console.error('Scoring failed:', error.message);
    process.exit(1);
  }

  const scoredCount = typeof data === 'number' ? data : 0;
  console.log(`Scored ${scoredCount} items.`);

  const { data: hidden, error: countError } = await supabase
    .from('items')
    .select('id, title, quality_score', { count: 'exact' })
    .lt('quality_score', 0)
    .order('quality_score', { ascending: true })
    .limit(20);
  if (countError) {
    console.error('Post-check failed:', countError.message);
    process.exit(1);
  }

  console.log(`\n${hidden?.length ?? 0} items scored below zero (will be hidden):`);
  for (const row of hidden ?? []) {
    const score = row.quality_score as number | null;
    console.log(`  ${score?.toFixed(3) ?? 'null'}  ${(row.title as string).slice(0, 80)}`);
  }
}

main().catch((err: unknown) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
