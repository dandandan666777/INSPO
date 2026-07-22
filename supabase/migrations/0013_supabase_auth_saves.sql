-- Cut over from the email-cookie identity to real Supabase Auth sessions.
-- user_saves is now keyed by auth.users.id and gated by RLS so authenticated
-- users can only see and mutate their own saves. Anonymous (signed-out)
-- users can't touch the table at all.
--
-- Existing rows are wiped because they were keyed by email under the previous
-- custom scheme — there's no reliable way to map an arbitrary email string to
-- a Supabase auth uuid, and there are no real users yet anyway.

drop table if exists user_saves;

create table user_saves (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id bigint not null references items(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

create index user_saves_user_idx on user_saves (user_id);

alter table user_saves enable row level security;

create policy "users read own saves"
  on user_saves for select
  using (auth.uid() = user_id);

create policy "users insert own saves"
  on user_saves for insert
  with check (auth.uid() = user_id);

create policy "users delete own saves"
  on user_saves for delete
  using (auth.uid() = user_id);
