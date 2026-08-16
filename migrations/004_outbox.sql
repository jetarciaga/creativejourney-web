-- Stage 6 · transactional notification outbox.
-- The inquiry and its notification rows are committed together. Delivery is
-- attempted immediately by the request path and retried in a later stage.

create table public.outbox (
  id             bigserial primary key,
  inquiry_id     uuid not null references public.inquiries(id),
  sink           text not null,
  payload        jsonb not null,
  attempts       int not null default 0,
  next_retry_at  timestamptz not null default now(),
  delivered_at   timestamptz,
  last_error     text
);

create index outbox_pending_idx
  on public.outbox (next_retry_at)
  where delivered_at is null;
