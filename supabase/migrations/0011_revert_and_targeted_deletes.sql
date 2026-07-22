-- The 4-negative-refs experiment in 0010 caught more outliers but at the cost
-- of hiding legitimate lifestyle/marketing product shots (an IKEA collection
-- launch photo has people in it, a robot press shot has text overlays, etc.).
-- Net trade was ~4 outliers caught for ~5 real products lost. Reverting to
-- the working 2-arg formulation (positive + game-only) and using surgical
-- title-pattern deletes to remove the specific outlier categories the wider
-- filter would have caught (film reviews, music video parodies, corporate
-- strategy pieces, software-UI-redesign articles, politics).

delete from items
where
  title ilike '%(Trailer)%'
  or title ilike '%Marilyn Manson%'
  or title ilike 'Why %RoboCop%'
  or title ilike '%YouTube%Redesign%'
  or title ilike 'The Village Creeple%'
  or title ilike '%The Future Of Amazon And Whole Foods%'
  or title ilike '%Tackling Extremism%'
  or title ilike '%How To Watch%';

drop function if exists score_all_items(vector, vector, vector, vector, vector);

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
