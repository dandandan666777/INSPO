import { supabaseAdmin } from '../lib/supabase';

async function main() {
  const supabase = supabaseAdmin();

  const { data, error } = await supabase
    .from('items')
    .select('id, title, quality_score, sources(name)')
    .gt('quality_score', 0)
    .lt('quality_score', 0.02)
    .order('quality_score', { ascending: true })
    .limit(30);
  if (error) throw new Error(error.message);

  type Row = {
    id: number;
    title: string;
    quality_score: number | null;
    sources: { name: string } | { name: string }[] | null;
  };
  console.log('Borderline items (0 < score < 0.02) — most-likely outliers:');
  for (const rawRow of (data ?? []) as unknown as Row[]) {
    const score = rawRow.quality_score !== null ? rawRow.quality_score.toFixed(4) : ' null ';
    const source = Array.isArray(rawRow.sources) ? rawRow.sources[0] : rawRow.sources;
    const src = source?.name ?? '?';
    console.log(`  ${score}  #${rawRow.id}  [${src}]  ${rawRow.title.slice(0, 78)}`);
  }
  console.log();

  const { count: totalScored } = await supabase
    .from('items')
    .select('*', { count: 'exact', head: true })
    .not('quality_score', 'is', null);
  const { count: visible } = await supabase
    .from('items')
    .select('*', { count: 'exact', head: true })
    .gt('quality_score', 0);
  const { count: hidden } = await supabase
    .from('items')
    .select('*', { count: 'exact', head: true })
    .lte('quality_score', 0);
  console.log(
    `Corpus: ${totalScored ?? 0} scored, ${visible ?? 0} visible, ${hidden ?? 0} hidden`,
  );
}

main().catch((err: unknown) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
