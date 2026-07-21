import { embedText } from './embeddings';
import { supabaseAdmin } from './supabase';

const DEFAULT_LIMIT = 30;

export type SearchResult = {
  id: number;
  source_id: number;
  source_name: string;
  source_homepage_url: string;
  title: string;
  description: string | null;
  source_url: string;
  image_r2_key: string;
  published_at: string | null;
  score?: number;
};

type BrowseRow = {
  id: number;
  source_id: number;
  title: string;
  description: string | null;
  source_url: string;
  image_r2_key: string;
  published_at: string | null;
  sources: { name: string; homepage_url: string } | null;
};

export async function browseItems(limit = DEFAULT_LIMIT): Promise<SearchResult[]> {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from('items')
    .select('id, source_id, title, description, source_url, image_r2_key, published_at, sources(name, homepage_url)')
    .not('image_r2_key', 'is', null)
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) throw new Error(`Browse failed: ${error.message}`);

  const rows = (data ?? []) as unknown as BrowseRow[];
  return rows.map((row) => ({
    id: row.id,
    source_id: row.source_id,
    source_name: row.sources?.name ?? '',
    source_homepage_url: row.sources?.homepage_url ?? '',
    title: row.title,
    description: row.description,
    source_url: row.source_url,
    image_r2_key: row.image_r2_key,
    published_at: row.published_at,
  }));
}

export async function getItemById(id: number): Promise<SearchResult | null> {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from('items')
    .select('id, source_id, title, description, source_url, image_r2_key, published_at, sources(name, homepage_url)')
    .eq('id', id)
    .not('image_r2_key', 'is', null)
    .maybeSingle();
  if (error) throw new Error(`Failed to load item ${id}: ${error.message}`);
  if (!data) return null;

  const row = data as unknown as BrowseRow;
  return {
    id: row.id,
    source_id: row.source_id,
    source_name: row.sources?.name ?? '',
    source_homepage_url: row.sources?.homepage_url ?? '',
    title: row.title,
    description: row.description,
    source_url: row.source_url,
    image_r2_key: row.image_r2_key,
    published_at: row.published_at,
  };
}

// CLIP was trained on image-caption pairs, so caption-shaped prompts recall
// better than bare noun phrases. "matte black finish" alone drifts toward
// abstract patterns; the wrapper anchors it to product photography.
function clipPrompt(query: string): string {
  return `a product design photograph of ${query}`;
}

export async function searchItems(query: string, limit = DEFAULT_LIMIT): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return browseItems(limit);

  const embedding = await embedText(clipPrompt(trimmed));
  const vectorLiteral = `[${embedding.join(',')}]`;

  const supabase = supabaseAdmin();
  const { data, error } = await supabase.rpc('search_items', {
    query_embedding: vectorLiteral,
    query_text: trimmed,
    match_count: limit,
  });
  if (error) throw new Error(`Search RPC failed: ${error.message}`);
  return (data ?? []) as SearchResult[];
}
