-- Enables pgvector for CLIP embedding similarity search.
create extension if not exists vector;

-- RSS feed sources. feed_url is the canonical identifier so seeding is idempotent.
create table sources (
  id bigint generated always as identity primary key,
  name text not null,
  feed_url text not null unique,
  homepage_url text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Individual items ingested from feeds. external_id is the feed's guid or link
-- (whatever the feed exposes as a stable per-item id) and is unique per source.
create table items (
  id bigint generated always as identity primary key,
  source_id bigint not null references sources (id) on delete cascade,
  external_id text not null,
  title text not null,
  description text,
  image_url text,
  source_url text not null,
  published_at timestamptz,
  image_r2_key text,
  embedding vector(768),
  ingested_at timestamptz not null default now(),
  unique (source_id, external_id)
);

-- Chronological browsing / recency ranking.
create index items_published_at_desc_idx on items (published_at desc nulls last);

-- Cosine-similarity index for CLIP embeddings. lists=10 is right-sized for
-- our target of ~500-5000 items across the MVP corpus. Reindex when the
-- corpus grows past ~10k items to keep recall high.
create index items_embedding_cosine_idx
  on items using ivfflat (embedding vector_cosine_ops)
  with (lists = 10);
