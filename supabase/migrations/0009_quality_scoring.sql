-- Filters non-product content (game trailers, app screenshots, cartoon-style
-- images) using the CLIP embeddings we already have. For each item we compute
--   score = (dist to negative reference) - (dist to positive reference)
-- so a score > 0 means the image is closer to "product design photograph"
-- than to "video game screenshot", and negative scores are the ones we want
-- to hide. The COALESCE in the callers defaults unscored items to visible
-- (fresh items ingested by the cron won't be scored until score-quality runs).

alter table items add column if not exists quality_score real;

create or replace function score_all_items(
  positive_embedding vector(768),
  negative_embedding vector(768)
) returns int
language plpgsql
volatile
as $$
declare
  affected int;
begin
  update items
  set quality_score =
    ((items.embedding <=> negative_embedding)::real - (items.embedding <=> positive_embedding)::real)
  where embedding is not null;
  get diagnostics affected = row_count;
  return affected;
end;
$$;

-- random_items now excludes anything CLIP thinks is more game-like than
-- product-like. Null scores pass through so the cron never runs a filter
-- against a value that hasn't been computed yet.
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
  where i.image_r2_key is not null
    and i.embedding is not null
    and coalesce(i.quality_score, 1.0) > 0
  order by random()
  limit match_count;
$$;

-- search_items applies the same filter inside the scored CTE.
create or replace function search_items(
  query_embedding vector(768),
  query_text text,
  match_count int default 30,
  vector_weight real default 0.7,
  text_weight real default 0.3,
  both_bonus real default 0.15
)
returns table (
  id bigint,
  source_id bigint,
  source_name text,
  source_homepage_url text,
  title text,
  description text,
  source_url text,
  image_r2_key text,
  published_at timestamptz,
  score real
)
language sql
stable
as $$
  with tsq as (
    select case
      when length(trim(query_text)) = 0 then null
      else websearch_to_tsquery('english', query_text)
    end as q
  ),
  scored as (
    select
      i.id,
      (1.0 - (i.embedding <=> query_embedding))::real as v_score,
      case
        when (select q from tsq) is null then 0.0::real
        when (setweight(to_tsvector('english', coalesce(i.title, '')), 'A')
              || setweight(to_tsvector('english', coalesce(i.description, '')), 'D'))
             @@ (select q from tsq)
          then ts_rank_cd(
            setweight(to_tsvector('english', coalesce(i.title, '')), 'A')
              || setweight(to_tsvector('english', coalesce(i.description, '')), 'D'),
            (select q from tsq)
          )
        else 0.0::real
      end as t_score
    from items i
    where i.embedding is not null
      and i.image_r2_key is not null
      and coalesce(i.quality_score, 1.0) > 0
  )
  select
    i.id,
    i.source_id,
    s.name as source_name,
    s.homepage_url as source_homepage_url,
    i.title,
    i.description,
    i.source_url,
    i.image_r2_key,
    i.published_at,
    (scored.v_score * vector_weight
     + scored.t_score * text_weight
     + case when scored.t_score > 0 then both_bonus else 0.0::real end
    )::real as score
  from scored
  join items i on i.id = scored.id
  join sources s on s.id = i.source_id
  order by score desc
  limit match_count;
$$;
