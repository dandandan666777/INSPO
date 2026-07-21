-- Text-match ranking now heavily favors matches in the title over matches in
-- the description. Postgres' ts_rank_cd applies weights per lexeme position
-- (A=1.0, B=0.4, C=0.2, D=0.1) and setweight() tags them. Tagging title as A
-- and description as D means a title hit contributes 10x what a description
-- hit does — enough to keep "Re-Thinking the Flower Vase" high on a vase
-- query while pushing "sports car informed by Enzo Mari vase" (where vase is
-- only in the description-ish body) down where it belongs.
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
