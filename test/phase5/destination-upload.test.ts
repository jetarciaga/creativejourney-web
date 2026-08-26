import { beforeEach, describe, expect, it, vi } from "vitest";

const authzMock = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
}));
const storageMock = vi.hoisted(() => ({
  createSignedUploadUrl: vi.fn(),
}));
const adminClientMock = vi.hoisted(() => ({
  storage: {
    from: vi.fn(() => storageMock),
  },
}));

vi.mock("@/lib/authz", () => authzMock);
vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/admin", () => ({
  createAdminSupabaseClient: vi.fn(() => adminClientMock),
}));

import { requestDestinationImageUpload } from "@/app/admin/destinations/actions";

describe("destination image upload action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authzMock.requireAdmin.mockResolvedValue({ user: { email: "admin@example.com" } });
    storageMock.createSignedUploadUrl.mockResolvedValue({
      data: { path: "ignored-by-server", token: "signed-token" },
      error: null,
    });
  });

  it("rejects a MIME type outside the storage allow-list", async () => {
    await expect(requestDestinationImageUpload("image/gif", 1000)).rejects.toThrow(
      /MIME type/,
    );
    expect(storageMock.createSignedUploadUrl).not.toHaveBeenCalled();
  });

  it("rejects an image above the 10MB bucket limit", async () => {
    await expect(
      requestDestinationImageUpload("image/webp", 10 * 1024 * 1024 + 1),
    ).rejects.toThrow(/size/);
    expect(storageMock.createSignedUploadUrl).not.toHaveBeenCalled();
  });

  it("derives the path from a UUID rather than a supplied filename", async () => {
    const result = await requestDestinationImageUpload("image/jpeg", 240_000);

    expect(result.token).toBe("signed-token");
    expect(result.path).toMatch(/^\d{4}\/[0-9a-f-]{36}\.jpg$/);
    expect(result.path).not.toContain("original-phone-photo");
    expect(storageMock.createSignedUploadUrl).toHaveBeenCalledWith(result.path);
  });

  it("checks admin access before requesting an upload URL", async () => {
    authzMock.requireAdmin.mockRejectedValue(new Error("not authorized"));

    await expect(
      requestDestinationImageUpload("image/webp", 240_000),
    ).rejects.toThrow("not authorized");
    expect(adminClientMock.storage.from).not.toHaveBeenCalled();
    expect(storageMock.createSignedUploadUrl).not.toHaveBeenCalled();
  });
});
