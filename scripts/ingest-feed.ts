import Parser from 'rss-parser';
import { supabaseAdmin } from '../lib/supabase';

type CustomItem = {
  mediaContent?: unknown;
  mediaThumbnail?: unknown;
  contentEncoded?: string;
};

const parser = new Parser<Record<string, never>, CustomItem>({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['content:encoded', 'contentEncoded'],
    ],
  },
});

type Source = {
  id: number;
  name: string;
  feed_url: string;
};

type ItemRow = {
  source_id: number;
  external_id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  source_url: string;
  published_at: string | null;
};

type IngestResult = {
  source: Source;
  upserted: number;
  skipped: number;
  failed: boolean;
};

// Media RSS elements come through xml2js as `{ $: { url, type, medium } }` or an array of that.
function urlFromMediaField(field: unknown): string | null {
  if (!field) return null;
  const first = Array.isArray(field) ? field[0] : field;
  if (typeof first !== 'object' || first === null) return null;
  const attrs = (first as { $?: { url?: unknown } }).$;
  const url = attrs?.url;
  return typeof url === 'string' ? url : null;
}

function firstImgFromHtml(html: string | null | undefined): string | null {
  if (!html) return null;
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] ?? null;
}

function extractImageUrl(item: Parser.Item & CustomItem): string | null {
  if (item.enclosure?.url) return item.enclosure.url;
  return (
    urlFromMediaField(item.mediaContent) ??
    urlFromMediaField(item.mediaThumbnail) ??
    firstImgFromHtml(item.contentEncoded) ??
    firstImgFromHtml(item.content)
  );
}

function toRow(item: Parser.Item & CustomItem, sourceId: number): ItemRow | null {
  const externalId = item.guid ?? item.link;
  const sourceUrl = item.link;
  if (!externalId || !item.title || !sourceUrl) return null;
  return {
    source_id: sourceId,
    external_id: externalId,
    title: item.title,
    description: item.contentSnippet ?? null,
    image_url: extractImageUrl(item),
    source_url: sourceUrl,
    published_at: item.isoDate ?? null,
  };
}

async function ingestSource(source: Source): Promise<IngestResult> {
  const supabase = supabaseAdmin();
  let feed: Awaited<ReturnType<typeof parser.parseURL>>;
  try {
    feed = await parser.parseURL(source.feed_url);
  } catch (err) {
    console.error(`[${source.name}] fetch failed:`, (err as Error).message);
    return { source, upserted: 0, skipped: 0, failed: true };
  }

  const rows: ItemRow[] = [];
  for (const item of feed.items) {
    const row = toRow(item, source.id);
    if (row) rows.push(row);
  }
  const skipped = feed.items.length - rows.length;

  if (rows.length === 0) {
    console.log(`[${source.name}] 0 valid items (${skipped} skipped)`);
    return { source, upserted: 0, skipped, failed: false };
  }

  const { data, error } = await supabase
    .from('items')
    .upsert(rows, { onConflict: 'source_id,external_id' })
    .select('id, image_url');

  if (error) {
    console.error(`[${source.name}] upsert failed:`, error.message);
    return { source, upserted: 0, skipped, failed: true };
  }

  const upserted = data?.length ?? 0;
  const withImage = (data ?? []).filter((r) => r.image_url).length;
  console.log(
    `[${source.name}] upserted ${upserted} items (${withImage} with image, ${skipped} skipped)`,
  );
  return { source, upserted, skipped, failed: false };
}

async function loadSources(sourceId: number | null): Promise<Source[]> {
  const supabase = supabaseAdmin();
  const base = supabase.from('sources').select('id, name, feed_url');
  const { data, error } =
    sourceId === null ? await base.eq('active', true) : await base.eq('id', sourceId);
  if (error) throw new Error(`Failed to load sources: ${error.message}`);
  return (data ?? []) as Source[];
}

async function main() {
  const arg = process.argv[2];
  let sourceId: number | null = null;
  if (arg !== undefined) {
    const parsed = Number.parseInt(arg, 10);
    if (Number.isNaN(parsed)) {
      console.error(`Invalid source id: ${arg}`);
      process.exit(1);
    }
    sourceId = parsed;
  }

  const sources = await loadSources(sourceId);
  if (sources.length === 0) {
    console.error(sourceId === null ? 'No active sources.' : `No source with id ${sourceId}.`);
    process.exit(1);
  }

  const results: IngestResult[] = [];
  for (const source of sources) {
    results.push(await ingestSource(source));
  }

  const total = results.reduce((sum, r) => sum + r.upserted, 0);
  const failed = results.filter((r) => r.failed).length;
  console.log(
    `\nDone. ${total} items across ${sources.length} source${sources.length === 1 ? '' : 's'}` +
      (failed > 0 ? ` (${failed} source${failed === 1 ? '' : 's'} failed)` : ''),
  );
  if (failed > 0) process.exit(1);
}

main().catch((err: unknown) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
