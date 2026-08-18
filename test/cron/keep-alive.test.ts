import { beforeEach, describe, expect, it, vi } from "vitest";

const supabaseMock = vi.hoisted(() => ({
  from: vi.fn(),
  select: vi.fn(),
  limit: vi.fn(),
}));
const createClientMock = vi.hoisted(() => vi.fn(() => supabaseMock));

vi.mock("@/lib/supabase/public", () => ({
  createPublicSupabaseClient: createClientMock,
}));

import { GET } from "@/app/api/cron/keep-alive/route";

function request(authorization?: string) {
  return new Request("http://localhost:3000/api/cron/keep-alive", {
    headers: authorization ? { authorization } : undefined,
  });
}

describe("GET /api/cron/keep-alive", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = "test-cron-secret";
    supabaseMock.from.mockReturnValue(supabaseMock);
    supabaseMock.select.mockReturnValue(supabaseMock);
    supabaseMock.limit.mockResolvedValue({ data: [{ id: "destination-1" }], error: null });
  });

  it("rejects a request without the correct authorization and does not call Supabase", async () => {
    const missing = await GET(request());
    const incorrect = await GET(request("Bearer wrong-secret"));

    expect(missing.status).toBe(401);
    expect(incorrect.status).toBe(401);
    expect(createClientMock).not.toHaveBeenCalled();
    expect(supabaseMock.from).not.toHaveBeenCalled();
  });

  it("runs the cheap public destinations read for an authorized request", async () => {
    const response = await GET(request("Bearer test-cron-secret"));

    expect(response.status).toBe(200);
    expect(createClientMock).toHaveBeenCalledOnce();
    expect(supabaseMock.from).toHaveBeenCalledWith("destinations");
    expect(supabaseMock.select).toHaveBeenCalledWith("id");
    expect(supabaseMock.limit).toHaveBeenCalledWith(1);
  });
});
