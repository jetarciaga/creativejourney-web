-- Stage 5 · database-backed destinations.
-- Public reads are allowed through the Data API; all writes are kept behind
-- the server-only service-role client used by the Auth.js-protected admin.

create table public.destinations (
  id                         uuid primary key default gen_random_uuid(),
  slug                       text not null unique,
  name                       text not null,
  region                     text not null,
  hero_image                 text not null,
  hero_image_alt             text not null,
  summary                    text not null,
  description                text not null,
  highlights                 text[] not null default '{}',
  suitable_for               text[] not null default '{}',
  featured                   boolean not null default false,
  display_order              integer not null default 0,
  inquiry_destination_value  text not null unique,
  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now(),
  constraint destinations_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint destinations_display_order_nonnegative check (display_order >= 0)
);

create index destinations_order_idx
  on public.destinations (featured desc, display_order asc, name asc);

create or replace function public.set_destinations_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger destinations_set_updated_at
before update on public.destinations
for each row
execute function public.set_destinations_updated_at();

alter table public.destinations enable row level security;

revoke all on public.destinations from anon, authenticated;
grant select on public.destinations to anon, authenticated;

create policy "destinations are publicly readable"
on public.destinations
for select
to anon, authenticated
using (true);
