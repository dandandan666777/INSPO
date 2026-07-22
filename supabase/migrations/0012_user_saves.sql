-- Email-as-identity persistence for the save feature. The email FK to
-- signups.email means any signup (either from the landing-page newsletter
-- form or from the first-save modal) is a valid "account" — saves and the
-- newsletter list share one identity table. Both cascades tidy up cleanly
-- if a signup ever gets removed.
create table user_saves (
  email text not null references signups(email) on delete cascade,
  item_id bigint not null references items(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (email, item_id)
);

create index user_saves_email_idx on user_saves (email);
