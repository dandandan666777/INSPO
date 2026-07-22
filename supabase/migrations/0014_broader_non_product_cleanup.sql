-- Second sweep of the corpus, driven by items still slipping past the
-- CLIP quality filter with legitimately positive scores (e.g. #122
-- "Multifunctional Scissors" — a Japanese product photo with annotation
-- overlays that scores 0.13 on the product-vs-game axis). Rather than push
-- the negative reference broader (which cost real product shots in the
-- 0010 experiment), delete by title pattern for categories the corpus
-- shouldn't include at all:
--   - Weekly Roundups (collage images)
--   - Competition / event announcements
--   - Specific Core77 Asian-design showcase pieces with heavy text overlays
--   - Awesomer novelty / DIY / food-and-drink posts
--   - Fast Company abstract-concept / futurism pieces
delete from items
where
  title ilike '%Weekly Roundup%'
  or title ilike 'Announcing %'
  or title ilike '%Bracket Madness%'
  or title ilike '%Multifunctional Scissors%'
  or title ilike '%Stud Finder%'
  or title ilike '%Magflap Clipboard%'
  or title ilike '%Riding Backwards%'
  or title ilike '%Painting Metal with Fire%'
  or title ilike '%Turning a Standing Desk%'
  or title ilike '%Turning Gary%'
  or title ilike '%Most Sampled Sounds%'
  or title ilike '%Prosecco%'
  or title ilike '%Werther%'
  or title ilike 'In The Future,%'
  or title ilike '%VR Might Help%'
  or title ilike '%One Sense Most People Ignore%'
  or title ilike '%Voice Into A Piece Of Pottery%'
  or title ilike '%Anti-Branding Strategy%'
  or title ilike '%Reborn As A New Creative Hub%'
  or title ilike '%Naval Factory%'
  or title ilike '%Doctor May Be An Avatar%';
