import { supabaseAdmin } from '../lib/supabase';

async function main() {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from('sources')
    .delete()
    .eq('name', 'Frame Magazine')
    .select('id');
  if (error) throw new Error(error.message);
  console.log(`Deleted ${data?.length ?? 0} Frame Magazine source row(s).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
