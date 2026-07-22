-- Two cleanups in one migration.
--
-- 1. Dedupe items by (source_id, title). Fast Company Design keeps handing
--    the same article a fresh guid each fetch, so our unique
--    (source_id, external_id) constraint doesn't catch them — leaving a
--    growing pile of identical rows in the corpus. Keep the newest row per
--    (source_id, title) pair, drop the rest.
--
-- 2. Enrich score_all_items to take four negative references instead of one,
--    and score against the WORST match — i.e. how close the image is to its
--    nearest bad category. This catches software UI screenshots, corporate
--    infographics, and entertainment/music scenes that the game-only
--    reference was missing.
--
--    score = (nearest bad-category distance) - (product-photo distance)
--    Higher = more product-like than any of the bad categories.

with ranked as (
  select
    id,
    row_number() over (partition by source_id, title order by id desc) as rn
  from items
)
delete from items where id in (select id from ranked where rn > 1);

drop function if exists score_all_items(vector, vector);

create or replace function score_all_items(
  positive vector(768),
  neg_game vector(768),
  neg_ui vector(768),
  neg_corp vector(768),
  neg_entertainment vector(768)
) returns int
language plpgsql
volatile
as $$
declare
  affected int;
begin
  update items
  set quality_score =
    (least(
      items.embedding <=> neg_game,
      items.embedding <=> neg_ui,
      items.embedding <=> neg_corp,
      items.embedding <=> neg_entertainment
    )::real - (items.embedding <=> positive)::real)
  where embedding is not null;
  get diagnostics affected = row_count;
  return affected;
end;
$$;
