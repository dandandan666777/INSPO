-- Adds tunable weight params to search_items and scores every item on both
-- signals in one pass. The old version limited each signal to top-90 rows
-- and then joined them, which meant text-relevant items (e.g. one whose
-- title literally contains "vase") could drop out of the pool if their
-- vector similarity wasn't also in the top-90. Now every eligible item
-- gets a full score = v*wv + t*wt + (t>0 ? bonus : 0). At 290 items the
-- full-table scan is milliseconds; would need to revisit at 50k+.
drop function if exists search_items(vector, text, int);

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
        when to_tsvector('english', coalesce(i.title, '') || ' ' || coalesce(i.description, ''))
             @@ (select q from tsq)
          then ts_rank_cd(
            to_tsvector('english', coalesce(i.title, '') || ' ' || coalesce(i.description, '')),
            (select q from tsq)
          )
        else 0.0::real
      end as t_score
    from items i
    where i.embedding is not null and i.image_r2_key is not null
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
