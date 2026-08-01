import { supabaseAdmin } from '../lib/supabase';

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: pnpm run delete-items <id1> <id2> …');
    process.exit(1);
  }
  const ids = args.map((a) => {
    const n = Number.parseInt(a, 10);
    if (Number.isNaN(n)) {
      console.error(`Invalid id: ${a}`);
      process.exit(1);
    }
    return n;
  });

  const supabase = supabaseAdmin();
  const { data: found, error: readErr } = await supabase
    .from('items')
    .select('id, title, source_id')
    .in('id', ids);
  if (readErr) throw new Error(readErr.message);

  if (!found || found.length === 0) {
    console.log('No matching items.');
    return;
  }

  console.log(`About to delete ${found.length} item(s):`);
  for (const row of found) {
    console.log(`  #${row.id}  ${(row.title as string).slice(0, 80)}`);
  }

  const { data: deleted, error: delErr } = await supabase
    .from('items')
    .delete()
    .in('id', ids)
    .select('id');
  if (delErr) throw new Error(delErr.message);
  console.log(`Deleted ${deleted?.length ?? 0} rows.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
