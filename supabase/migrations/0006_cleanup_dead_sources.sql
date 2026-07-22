-- Removes two sources that turned out to be dead ends:
--   Nothing: the /blogs/news.atom URL returns HTML from a Shopify storefront,
--     not an Atom feed. Every ingest run threw on parse.
--   Apple Newsroom: real Atom feed, but content is mostly non-design (sports
--     schedules, Emmy nominations, App Store news) and images live in a
--     <link rel="enclosure"> element that the current ingest extractor
--     doesn't handle. 20 orphan items with no image_r2_key were sitting in
--     the items table doing nothing.
-- ON DELETE CASCADE on items.source_id cleans up their items automatically.
delete from sources where name in ('Apple Newsroom', 'Nothing');
