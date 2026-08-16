-- Stage 6 · inquiries and outbox contain PII and are server-only.
-- The service-role client used by the Route Handler bypasses RLS; browser
-- roles receive neither a policy nor a table privilege.

alter table public.inquiries enable row level security;
alter table public.outbox enable row level security;

revoke all on table public.inquiries from anon, authenticated;
revoke all on table public.outbox from anon, authenticated;

-- Keep the multi-write operation atomic while exposing it only through the
-- server-only service-role client. The route validates the JSON before calling
-- this function; the database remains the transaction boundary and still
-- supplies reference_code through its existing DEFAULT.
create or replace function public.create_inquiry_with_outbox(
  p_inquiry              jsonb,
  p_notification_payload jsonb,
  p_ip_hash              text,
  p_whatsapp_raw         text,
  p_referrer              text,
  p_utm_source            text,
  p_user_agent            text,
  p_consent_at            timestamptz
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_inquiry_id uuid;
  v_reference_code text;
  v_payload jsonb;
  v_agency_outbox_id bigint;
  v_customer_outbox_id bigint;
begin
  insert into public.inquiries (
    destination,
    referrer,
    utm_source,
    arrival_date,
    departure_date,
    nights_submitted,
    nights_computed,
    nights_mismatch,
    pax_count,
    accommodation_tier,
    room_config,
    budget_range,
    notes,
    contact_name,
    company_name,
    email,
    whatsapp_e164,
    whatsapp_raw,
    address,
    consent_privacy,
    consent_marketing,
    consent_at,
    ip_hash,
    user_agent
  ) values (
    nullif(p_inquiry->>'destination', ''),
    p_referrer,
    p_utm_source,
    (p_inquiry->>'arrivalDate')::date,
    (p_inquiry->>'departureDate')::date,
    (p_inquiry->>'nightsSubmitted')::int,
    (p_inquiry->>'nightsComputed')::int,
    (p_inquiry->>'nightsMismatch')::boolean,
    (p_inquiry->>'paxCount')::int,
    p_inquiry->>'accommodationTier',
    nullif(p_inquiry->>'roomConfig', ''),
    nullif(p_inquiry->>'budgetRange', ''),
    nullif(p_inquiry->>'notes', ''),
    p_inquiry->>'contactName',
    nullif(p_inquiry->>'companyName', ''),
    p_inquiry->>'email',
    p_inquiry->>'whatsapp',
    p_whatsapp_raw,
    p_inquiry->>'address',
    (p_inquiry->>'consentPrivacy')::boolean,
    coalesce((p_inquiry->>'consentMarketing')::boolean, false),
    p_consent_at,
    p_ip_hash,
    p_user_agent
  )
  returning id, reference_code into v_inquiry_id, v_reference_code;

  v_payload := jsonb_set(
    p_notification_payload,
    '{referenceCode}',
    to_jsonb(v_reference_code),
    true
  );

  insert into public.outbox (inquiry_id, sink, payload)
  values (v_inquiry_id, 'email_agency', v_payload)
  returning id into v_agency_outbox_id;

  insert into public.outbox (inquiry_id, sink, payload)
  values (v_inquiry_id, 'email_customer', v_payload)
  returning id into v_customer_outbox_id;

  return jsonb_build_object(
    'id', v_inquiry_id,
    'referenceCode', v_reference_code,
    'outboxRows', jsonb_build_array(
      jsonb_build_object(
        'id', v_agency_outbox_id,
        'sink', 'email_agency',
        'payload', v_payload
      ),
      jsonb_build_object(
        'id', v_customer_outbox_id,
        'sink', 'email_customer',
        'payload', v_payload
      )
    )
  );
end;
$$;

create or replace function public.mark_outbox_delivered(p_outbox_id bigint)
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  update public.outbox
  set delivered_at = now(), attempts = attempts + 1, last_error = null
  where id = p_outbox_id;
$$;

create or replace function public.mark_outbox_failed(p_outbox_id bigint, p_error text)
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  update public.outbox
  set attempts = attempts + 1,
      next_retry_at = now(),
      last_error = left(coalesce(p_error, 'Notification failed'), 2000)
  where id = p_outbox_id;
$$;

revoke all on function public.create_inquiry_with_outbox(jsonb, jsonb, text, text, text, text, text, timestamptz) from public, anon, authenticated;
revoke all on function public.mark_outbox_delivered(bigint) from public, anon, authenticated;
revoke all on function public.mark_outbox_failed(bigint, text) from public, anon, authenticated;

grant execute on function public.create_inquiry_with_outbox(jsonb, jsonb, text, text, text, text, text, timestamptz) to service_role;
grant execute on function public.mark_outbox_delivered(bigint) to service_role;
grant execute on function public.mark_outbox_failed(bigint, text) to service_role;
