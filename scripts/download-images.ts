import { PutObjectCommand, type S3Client } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import type { SupabaseClient } from '@supabase/supabase-js';
import { r2Bucket, r2Client } from '../lib/r2';
import { supabaseAdmin } from '../lib/supabase';

const MAX_WIDTH = 800;
const JPEG_QUALITY = 80;
const CONCURRENCY = 5;

type Item = { id: number; image_url: string };

type ProcessContext = {
  r2: S3Client;
  bucket: string;
  supabase: SupabaseClient;
};

type ProcessResult = { id: number; ok: boolean; error?: string };

async function fetchOriginal(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status} fetching ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

async function resizeToJpeg(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY })
    .toBuffer();
}

async function processItem(item: Item, ctx: ProcessContext): Promise<ProcessResult> {
  try {
    const original = await fetchOriginal(item.image_url);
    const resized = await resizeToJpeg(original);
    const key = `items/${item.id}.jpg`;
    await ctx.r2.send(
      new PutObjectCommand({
        Bucket: ctx.bucket,
        Key: key,
        Body: resized,
        ContentType: 'image/jpeg',
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );
    const { error } = await ctx.supabase
      .from('items')
      .update({ image_r2_key: key })
      .eq('id', item.id);
    if (error) throw new Error(error.message);
    return { id: item.id, ok: true };
  } catch (err) {
    return { id: item.id, ok: false, error: (err as Error).message };
  }
}

async function main() {
  const supabase = supabaseAdmin();
  const { data, error } = await supabase
    .from('items')
    .select('id, image_url')
    .is('image_r2_key', null)
    .not('image_url', 'is', null)
    .order('id', { ascending: true });

  if (error) {
    console.error('Failed to load items:', error.message);
    process.exit(1);
  }

  const items = (data ?? []) as Item[];
  if (items.length === 0) {
    console.log('No items need image download.');
    return;
  }

  const ctx: ProcessContext = {
    r2: r2Client(),
    bucket: r2Bucket(),
    supabase,
  };

  console.log(`Processing ${items.length} items (concurrency ${CONCURRENCY})...`);

  let done = 0;
  let failed = 0;
  for (let i = 0; i < items.length; i += CONCURRENCY) {
    const chunk = items.slice(i, i + CONCURRENCY);
    const results = await Promise.all(chunk.map((item) => processItem(item, ctx)));
    for (const r of results) {
      done++;
      if (!r.ok) {
        failed++;
        console.error(`  #${r.id} failed: ${r.error ?? 'unknown error'}`);
      }
    }
    console.log(`  progress: ${done}/${items.length} (${failed} failed)`);
  }

  console.log(`\nDone. Uploaded ${done - failed} images. ${failed} failure${failed === 1 ? '' : 's'}.`);
  if (failed === items.length) process.exit(1);
}

main().catch((err: unknown) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
