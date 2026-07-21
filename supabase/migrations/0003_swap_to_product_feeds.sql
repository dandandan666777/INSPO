-- Swap firehose RSS feeds for product-category-specific feeds so the corpus
-- reflects the industrial/product-design wedge instead of being architecture-heavy.
-- Deletes items belonging to the three swapped sources so the old architecture
-- content stops polluting search results; Yanko + Core77 items are left alone.
-- R2 objects for the deleted items are left as harmless orphans (few MB total).
update sources set feed_url = 'https://www.dezeen.com/design/feed/' where name = 'Dezeen';
update sources set feed_url = 'https://www.designboom.com/design/feed/' where name = 'Designboom';
update sources set feed_url = 'https://design-milk.com/category/home-furnishings/feed/' where name = 'Design Milk';

delete from items
where source_id in (select id from sources where name in ('Dezeen', 'Designboom', 'Design Milk'));
