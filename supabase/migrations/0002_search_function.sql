-- Hybrid semantic + text search. Combines pgvector cosine similarity on
-- the CLIP embedding with Postgres full-text search on title+description.
-- Items appearing in both signals get a small bonus to reward strong matches.
create or replace function search_items(
  query_embedding vector(768),
  query_text text,
  match_count int default 30
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
  with vector_search as (
    select
      i.id,
      (1.0 - (i.embedding <=> query_embedding))::real as vector_score
    from items i
    where i.embedding is not null and i.image_r2_key is not null
    order by i.embedding <=> query_embedding
    limit match_count * 3
  ),
  text_query as (
    select case
      when length(trim(query_text)) = 0 then null
      else websearch_to_tsquery('english', query_text)
    end as tsq
  ),
  text_search as (
    select
      i.id,
      ts_rank_cd(
        to_tsvector('english', coalesce(i.title, '') || ' ' || coalesce(i.description, '')),
        (select tsq from text_query)
      ) as text_score
    from items i
    where i.image_r2_key is not null
      and (select tsq from text_query) is not null
      and to_tsvector('english', coalesce(i.title, '') || ' ' || coalesce(i.description, ''))
          @@ (select tsq from text_query)
    limit match_count * 3
  ),
  combined as (
    select
      coalesce(v.id, t.id) as id,
      coalesce(v.vector_score, 0) as vector_score,
      coalesce(t.text_score, 0) as text_score,
      case when v.id is not null and t.id is not null then 0.15 else 0.0 end as both_bonus
    from vector_search v
    full outer join text_search t on v.id = t.id
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
    (c.vector_score * 0.7 + c.text_score * 0.3 + c.both_bonus)::real as score
  from combined c
  join items i on i.id = c.id
  join sources s on s.id = i.source_id
  order by score desc
  limit match_count;
$$;
