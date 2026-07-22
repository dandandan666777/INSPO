import { embedText } from './embeddings';
import { supabaseAdmin } from './supabase';

const DEFAULT_LIMIT = 30;

// MIN_SCORE is now query-type-aware — see weightsFor() and the QUERY_TYPES
// table below. Concrete queries stay strict; abstract ones relax so
// vector-only browsing surfaces like "warm colours" can return results.

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

// Classifying queries into three buckets lets the ranker do the right thing
// for each: strict text-driven for specific products, balanced for mixed,
// vector-driven with a lower threshold for broad style/property browsing.
//
// MODIFIER_WORDS: adjectives that describe how something looks/feels.
// PROPERTY_NOUNS: nouns that name a visual property rather than a product.
// A query whose non-modifier words are all in PROPERTY_NOUNS ("warm colours",
// "rounded edges", "flowing shapes") gets treated as abstract.
const MODIFIER_WORDS = new Set([
  'matte', 'glossy', 'brushed', 'polished', 'weathered', 'patinated', 'raw', 'worn', 'aged',
  'warm', 'cool', 'cold', 'hot', 'dark', 'light', 'muted', 'vibrant', 'bold', 'subtle',
  'black', 'white', 'grey', 'gray', 'red', 'blue', 'green', 'orange', 'yellow',
  'pink', 'purple', 'brown', 'beige', 'ivory', 'terracotta', 'sage', 'olive',
  'aluminum', 'aluminium', 'wooden', 'wood', 'oak', 'walnut', 'ash', 'birch',
  'ceramic', 'leather', 'brass', 'copper', 'steel', 'concrete', 'marble', 'plastic',
  'circular', 'square', 'round', 'rounded', 'flat', 'curved', 'angular', 'geometric', 'organic', 'flowing',
  'soft', 'hard', 'smooth', 'rough', 'sleek', 'chunky', 'slim', 'thick', 'thin',
  'minimal', 'minimalist', 'modern', 'vintage', 'retro', 'futuristic', 'industrial', 'brutalist',
  'cozy', 'cosy', 'monochrome', 'monotone',
]);

const PROPERTY_NOUNS = new Set([
  'colour', 'colours', 'color', 'colors', 'tone', 'tones', 'hue', 'hues', 'palette',
  'shape', 'shapes', 'form', 'forms', 'geometry',
  'edge', 'edges', 'corner', 'corners', 'line', 'lines', 'curve', 'curves',
  'finish', 'surface', 'texture', 'material', 'grain', 'pattern', 'motif',
  'style', 'vibe', 'mood', 'aesthetic', 'look', 'feel',
]);

type QueryType = 'concrete' | 'mixed' | 'abstract';
type Weights = {
  vector_weight: number;
  text_weight: number;
  both_bonus: number;
  min_score: number;
};

// Thresholds calibrated to score distributions:
// - Concrete queries lift real matches to >=0.5 via text-match, so a strict
//   0.30 cut cleanly drops the CLIP-fishing tail.
// - Mixed queries often see text_score=0 (both "wooden" AND "chair" in title
//   is rare), so score = 0.7 * vector. Real matches land at 0.22-0.35.
// - Abstract queries are vector-only against a text embedding; CLIP cosine
//   caps around 0.15-0.20 for these. A stricter cut returns nothing.
const WEIGHTS_BY_TYPE: Record<QueryType, Weights> = {
  concrete: { vector_weight: 0.5, text_weight: 0.5, both_bonus: 0.25, min_score: 0.3 },
  mixed:    { vector_weight: 0.7, text_weight: 0.3, both_bonus: 0.15, min_score: 0.2 },
  abstract: { vector_weight: 0.9, text_weight: 0.1, both_bonus: 0.05, min_score: 0.15 },
};

function classifyQuery(query: string): QueryType {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'concrete';
  const productNounCount = words.filter(
    (w) => !MODIFIER_WORDS.has(w) && !PROPERTY_NOUNS.has(w),
  ).length;
  if (productNounCount === 0) return 'abstract';
  if (words.length <= 2 && productNounCount === words.length) return 'concrete';
  return 'mixed';
}

// For mixed queries ("wooden chair", "black watch"), text-search only the
// product nouns — otherwise websearch_to_tsquery ANDs the terms and requires
// both "wooden" and "chair" to appear in the title, which is rare. Vector
// side still sees the full query so it can rerank by the modifier's vibe.
function productNounsOnly(query: string): string {
  return query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => !MODIFIER_WORDS.has(w) && !PROPERTY_NOUNS.has(w))
    .join(' ');
}

function weightsFor(query: string): Weights {
  return WEIGHTS_BY_TYPE[classifyQuery(query)];
}

export async function searchItems(query: string, limit = DEFAULT_LIMIT): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return browseItems(limit);

  const embedding = await embedText(clipPrompt(trimmed));
  const vectorLiteral = `[${embedding.join(',')}]`;
  const queryType = classifyQuery(trimmed);
  const { min_score, ...weights } = WEIGHTS_BY_TYPE[queryType];
  const textQuery = queryType === 'mixed' ? productNounsOnly(trimmed) : trimmed;

  const supabase = supabaseAdmin();
  const { data, error } = await supabase.rpc('search_items', {
    query_embedding: vectorLiteral,
    query_text: expandTextQuery(textQuery),
    match_count: limit,
    ...weights,
  });
  if (error) throw new Error(`Search RPC failed: ${error.message}`);
  const results = (data ?? []) as SearchResult[];
  return results.filter((row) => (row.score ?? 0) >= min_score);
}
