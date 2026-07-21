import { embedText } from './embeddings';
import { supabaseAdmin } from './supabase';

const DEFAULT_LIMIT = 30;

// After the concrete-noun boost + title-weighted text-match landed, real
// matches score ≥0.35 and incidental description mentions cluster around
// 0.20-0.28. 0.30 is the cleanest cut: keeps the Sonos/Hi-Fi speaker wins
// and drops the "sports car with 'vase' in the description" false positives.
const MIN_SCORE = 0.3;

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

export type SourceRow = {
  id: number;
  name: string;
  homepage_url: string;
  feed_url: string;
};

export async function listActiveSources(): Promise<SourceRow[]> {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from('sources')
    .select('id, name, homepage_url, feed_url')
    .eq('active', true)
    .order('name');
  if (error) throw new Error(`Failed to load sources: ${error.message}`);
  return (data ?? []) as SourceRow[];
}

export async function countEmbeddedItems(): Promise<number> {
  const supabase = supabaseAdmin();
  const { count, error } = await supabase
    .from('items')
    .select('*', { count: 'exact', head: true })
    .not('embedding', 'is', null);
  if (error) throw new Error(`Failed to count items: ${error.message}`);
  return count ?? 0;
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

// Postgres full-text search treats "iphone" and "phone" as separate tokens.
// Expanding the TEXT side to sibling terms lets "phone" pick up iPhone-titled
// articles (whose vector score alone would sit below MIN_SCORE). Vector side
// stays on the raw query — CLIP handles visual synonymy on its own.
const TEXT_ALIASES: Record<string, readonly string[]> = {
  phone: ['iphone', 'smartphone'],
  iphone: ['phone', 'smartphone'],
  smartphone: ['phone', 'iphone'],
  tv: ['television'],
  television: ['tv'],
  laptop: ['macbook', 'notebook'],
  headphones: ['earbuds', 'earphones', 'headphone'],
  earbuds: ['headphones', 'earphones', 'earbud'],
  earphones: ['headphones', 'earbuds'],
  speaker: ['speakers', 'soundbar'],
  speakers: ['speaker', 'soundbar'],
  watch: ['smartwatch', 'timepiece'],
  smartwatch: ['watch', 'timepiece'],
  bag: ['backpack', 'tote'],
  car: ['vehicle', 'automobile'],
  couch: ['sofa'],
  sofa: ['couch'],
  fridge: ['refrigerator'],
};

function expandTextQuery(query: string): string {
  const words = query.trim().toLowerCase().split(/\s+/);
  return words
    .map((word) => {
      const aliases = TEXT_ALIASES[word];
      return aliases ? `(${[word, ...aliases].join(' OR ')})` : word;
    })
    .join(' ');
}

// Concrete-noun queries ("chair", "watch", "camera") should favor the
// text-match signal so items whose title literally contains the word rise
// above things that are merely visually similar. Abstract queries
// ("matte black finish", "warm oak grain") should stay vector-heavy.
const MODIFIER_WORDS = new Set([
  'matte', 'glossy', 'brushed', 'polished', 'warm', 'cool', 'dark', 'light',
  'black', 'white', 'red', 'blue', 'green', 'orange', 'yellow', 'terracotta',
  'aluminum', 'aluminium', 'wooden', 'wood', 'oak', 'walnut', 'ceramic', 'leather',
  'circular', 'square', 'round', 'rounded', 'flat', 'curved',
  'soft', 'hard', 'smooth', 'rough', 'sleek', 'minimal', 'minimalist',
  'modern', 'vintage', 'retro',
]);

type Weights = { vector_weight: number; text_weight: number; both_bonus: number };

function weightsFor(query: string): Weights {
  const words = query.trim().toLowerCase().split(/\s+/);
  const isConcrete = words.length <= 2 && !words.some((w) => MODIFIER_WORDS.has(w));
  return isConcrete
    ? { vector_weight: 0.5, text_weight: 0.5, both_bonus: 0.25 }
    : { vector_weight: 0.7, text_weight: 0.3, both_bonus: 0.15 };
}

export async function searchItems(query: string, limit = DEFAULT_LIMIT): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return browseItems(limit);

  const embedding = await embedText(clipPrompt(trimmed));
  const vectorLiteral = `[${embedding.join(',')}]`;
  const weights = weightsFor(trimmed);

  const supabase = supabaseAdmin();
  const { data, error } = await supabase.rpc('search_items', {
    query_embedding: vectorLiteral,
    query_text: expandTextQuery(trimmed),
    match_count: limit,
    ...weights,
  });
  if (error) throw new Error(`Search RPC failed: ${error.message}`);
  const results = (data ?? []) as SearchResult[];
  return results.filter((row) => (row.score ?? 0) >= MIN_SCORE);
}
