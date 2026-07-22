import { supabaseAdmin } from '../lib/supabase';

async function main() {
  const supabase = supabaseAdmin();
  const sourceName = process.argv[2] ?? 'Core77';

  const { data: sources, error: sErr } = await supabase
    .from('sources')
    .select('id')
    .eq('name', sourceName)
    .maybeSingle();
  if (sErr || !sources) {
    console.error('Source not found:', sourceName);
    process.exit(1);
  }

  const { data, error } = await supabase
    .from('items')
    .select('id, title, quality_score')
    .eq('source_id', sources.id)
    .order('quality_score', { ascending: true });
  if (error) throw new Error(error.message);

  console.log(`${sourceName} items (${data?.length ?? 0}), lowest quality first:`);
  for (const r of data ?? []) {
    const s = r.quality_score !== null ? r.quality_score.toFixed(4) : ' null ';
    console.log(`  ${s}  #${r.id}  ${r.title.slice(0, 80)}`);
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
