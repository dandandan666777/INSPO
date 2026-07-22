-- Simple email list for the landing page "Stay up to date" form.
-- No verification flow; just a capture surface so signups persist somewhere
-- durable and can be exported later. Unique constraint makes the client-side
-- "already subscribed" case indistinguishable from a fresh subscribe, which
-- is fine — same user-facing "thanks" either way.
create table signups (
  id bigint generated always as identity primary key,
  email text not null unique,
  created_at timestamptz not null default now()
);
