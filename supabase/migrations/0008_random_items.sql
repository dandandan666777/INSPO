-- Random shuffle for the explore/browse empty-state.
-- order by random() over ~300 items is milliseconds; would need pg_prewarm
-- or a materialized tsvector-of-ids trick if the corpus ever got to ~100k.
-- Marked volatile because random() is volatile and Postgres can otherwise
-- cache the plan and reuse the same shuffle across calls in one txn.
create or replace function random_items(match_count int default 30)
returns table (
  id bigint,
  source_id bigint,
  source_name text,
  source_homepage_url text,
  title text,
  description text,
  source_url text,
  image_r2_key text,
  published_at timestamptz
)
language sql
volatile
as $$
  select
    i.id,
    i.source_id,
    s.name as source_name,
    s.homepage_url as source_homepage_url,
    i.title,
    i.description,
    i.source_url,
    i.image_r2_key,
    i.published_at
  from items i
  join sources s on s.id = i.source_id
  where i.image_r2_key is not null and i.embedding is not null
  order by random()
  limit match_count;
$$;
