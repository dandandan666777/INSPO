import { supabaseAdmin } from '../lib/supabase';

type SourceSeed = {
  name: string;
  feed_url: string;
  homepage_url: string;
};

const sources: SourceSeed[] = [
  {
    name: 'Dezeen',
    feed_url: 'https://www.dezeen.com/design/feed/',
    homepage_url: 'https://www.dezeen.com',
  },
  {
    name: 'Yanko Design',
    feed_url: 'https://www.yankodesign.com/feed/',
    homepage_url: 'https://www.yankodesign.com',
  },
  {
    name: 'Core77',
    feed_url: 'https://www.core77.com/blog/rss.xml',
    homepage_url: 'https://www.core77.com',
  },
  {
    name: 'Design Milk',
    feed_url: 'https://design-milk.com/category/home-furnishings/feed/',
    homepage_url: 'https://design-milk.com',
  },
  {
    name: 'Designboom',
    feed_url: 'https://www.designboom.com/design/feed/',
    homepage_url: 'https://www.designboom.com',
  },
  {
    name: 'Cool Hunting',
    feed_url: 'https://coolhunting.com/feed/',
    homepage_url: 'https://coolhunting.com',
  },
  {
    name: 'Gessato',
    feed_url: 'https://www.gessato.com/feed/',
    homepage_url: 'https://www.gessato.com',
  },
  {
    name: 'Fast Company Design',
    feed_url: 'https://www.fastcompany.com/section/co-design/rss',
    homepage_url: 'https://www.fastcompany.com/co-design',
  },
  {
    name: 'Hypebeast Design',
    feed_url: 'https://hypebeast.com/design/feed',
    homepage_url: 'https://hypebeast.com/design',
  },
  {
    name: 'Gear Patrol',
    feed_url: 'https://gearpatrol.com/feed/',
    homepage_url: 'https://gearpatrol.com',
  },
];

async function main() {
  const supabase = supabaseAdmin();

  const { data, error } = await supabase
    .from('sources')
    .upsert(sources, { onConflict: 'feed_url' })
    .select('id, name, feed_url');

  if (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }

  const rows = data ?? [];
  console.log(`Upserted ${rows.length} source${rows.length === 1 ? '' : 's'}:`);
  for (const row of rows) {
    console.log(`  #${row.id}  ${row.name.padEnd(14)}  ${row.feed_url}`);
  }
}

main().catch((err: unknown) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
