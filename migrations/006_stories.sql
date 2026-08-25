-- Stage 8 · client success stories.
-- Public reads are restricted to published rows; all writes stay behind the
-- server-only service-role client used by the Auth.js-protected admin.

create table public.stories (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  title            text not null,
  story_date       date not null,
  cover_image_path text not null,
  cover_image_alt  text not null,
  body             text not null,
  published        boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint stories_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

create index stories_public_order_idx
  on public.stories (published, story_date desc, created_at desc);

create or replace function public.set_stories_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger stories_set_updated_at
before update on public.stories
for each row
execute function public.set_stories_updated_at();

alter table public.stories enable row level security;
revoke all on public.stories from anon, authenticated;
grant select on public.stories to anon, authenticated;

create policy "published stories are publicly readable"
on public.stories for select to anon, authenticated
using (published = true);
