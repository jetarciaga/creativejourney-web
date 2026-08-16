import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migrationsDir = path.resolve(__dirname, "../../migrations");

describe("Stage 6 inquiry migrations", () => {
  it("keeps the existing inquiry migration available and unchanged in shape", () => {
    const migration = readFileSync(path.join(migrationsDir, "001_inquiries.sql"), "utf8");
    expect(migration).toContain("CREATE TABLE inquiries");
    expect(migration).toContain("DEFAULT next_reference_code()");
    expect(migration).toContain("whatsapp_raw");
  });

  it("defines the transactional outbox and pending-row index", () => {
    const migration = readFileSync(path.join(migrationsDir, "004_outbox.sql"), "utf8");
    expect(migration).toMatch(/create table public\.outbox/i);
    expect(migration).toMatch(/inquiry_id\s+uuid\s+not null references public\.inquiries\(id\)/i);
    expect(migration).toMatch(/payload\s+jsonb\s+not null/i);
    expect(migration).toMatch(/create index[\s\S]*?where delivered_at is null/i);
  });

  it("revokes all client privileges and enables RLS for both PII tables", () => {
    const migration = readFileSync(path.join(migrationsDir, "005_inquiry-rls.sql"), "utf8");
    expect(migration).toMatch(/alter table public\.inquiries enable row level security/i);
    expect(migration).toMatch(/alter table public\.outbox enable row level security/i);
    expect(migration).toMatch(/revoke all on table public\.inquiries from anon, authenticated/i);
    expect(migration).toMatch(/revoke all on table public\.outbox from anon, authenticated/i);
    expect(migration).not.toMatch(/grant\s+select/i);
    expect(migration).toMatch(/create or replace function public\.create_inquiry_with_outbox/i);
    expect(migration).toMatch(/grant execute on function public\.create_inquiry_with_outbox/i);
  });
});
