import Replicate from 'replicate';

// Version pinned so embeddings stay in the same vector space over time.
// Bump only alongside a full re-embed of the corpus.
const CLIP_MODEL =
  'andreasjansson/clip-features:75b33f253f7714a281ad3e9b28f63e3232d583716ef6718f2e46641077ea040a';
const EMBEDDING_DIM = 768;
const MAX_RETRIES = 6;
const RETRY_BASE_DELAY_MS = 2000;
const RETRY_AFTER_BUFFER_MS = 500;

type CLIPResult = { input: string; embedding: number[] };

let cached: Replicate | null = null;

function getClient(): Replicate {
  if (cached) return cached;
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new Error('Environment variable REPLICATE_API_TOKEN is not set');
  cached = new Replicate({ auth: token });
  return cached;
}

function extractRetryAfterMs(err: unknown): number | null {
  const message = err instanceof Error ? err.message : '';
  const match = message.match(/"retry_after":\s*(\d+)/);
  if (!match) return null;
  return Number.parseInt(match[1], 10) * 1000 + RETRY_AFTER_BUFFER_MS;
}

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt >= MAX_RETRIES - 1) break;
      const retryAfterMs = extractRetryAfterMs(err);
      const delayMs = retryAfterMs ?? RETRY_BASE_DELAY_MS * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw lastError;
}

function assertEmbedding(v: unknown): number[] {
  if (!Array.isArray(v)) {
    throw new Error(`CLIP embedding is not an array: ${typeof v}`);
  }
  if (v.length !== EMBEDDING_DIM) {
    throw new Error(`CLIP embedding has dim ${v.length}, expected ${EMBEDDING_DIM}`);
  }
  for (const n of v) {
    if (typeof n !== 'number') throw new Error('CLIP embedding contains non-numeric element');
  }
  return v as number[];
}

async function embed(input: string): Promise<number[]> {
  const output = await withRetry(() =>
    getClient().run(CLIP_MODEL, { input: { inputs: input } }),
  );
  if (!Array.isArray(output) || output.length === 0) {
    throw new Error(`Empty or unexpected CLIP output: ${JSON.stringify(output).slice(0, 200)}`);
  }
  return assertEmbedding((output as CLIPResult[])[0].embedding);
}

export function embedImage(url: string): Promise<number[]> {
  return embed(url);
}

export function embedText(text: string): Promise<number[]> {
  return embed(text);
}
