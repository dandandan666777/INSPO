-- Feedback capture surface for the site-wide "got something to see or say?"
-- form at the bottom of every page. Rows are tied to auth.users.id so we
-- can follow up with the user by email, and RLS is enforced so nobody but
-- Supabase-service-role can read the whole table.
create table feedback (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index feedback_user_idx on feedback (user_id);
create index feedback_created_at_desc_idx on feedback (created_at desc);

alter table feedback enable row level security;

-- Users can insert their own feedback. No read/update/delete policies —
-- reading the corpus is a service-role admin operation (Supabase dashboard
-- SQL editor, or a future admin route).
create policy "users insert own feedback"
  on feedback for insert
  with check (auth.uid() = user_id);
