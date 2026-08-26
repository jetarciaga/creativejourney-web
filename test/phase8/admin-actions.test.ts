import { beforeEach, describe, expect, it, vi } from "vitest";

const authzMock = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
}));
const navigationMock = vi.hoisted(() => ({
  redirect: vi.fn(),
}));
const cacheMock = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
}));
const destinationDataMock = vi.hoisted(() => ({
  createAdminDestination: vi.fn(),
  deleteAdminDestination: vi.fn(),
  getAdminDestinationById: vi.fn(),
  updateAdminDestination: vi.fn(),
}));
const storyDataMock = vi.hoisted(() => ({
  createAdminStory: vi.fn(),
  createStoryImageUploadUrl: vi.fn(),
  deleteAdminStory: vi.fn(),
  getAdminStoryById: vi.fn(),
  updateAdminStory: vi.fn(),
}));

vi.mock("@/lib/authz", () => authzMock);
vi.mock("@/lib/destinations", () => destinationDataMock);
vi.mock("@/lib/stories", () => storyDataMock);
vi.mock("next/cache", () => cacheMock);
vi.mock("next/navigation", () => navigationMock);

import {
  createDestination,
  updateDestination,
} from "@/app/admin/destinations/actions";
import { createStory, updateStory } from "@/app/admin/stories/actions";

const destinationId = "11111111-1111-4111-8111-111111111111";
const storyId = "22222222-2222-4222-8222-222222222222";

function destinationFormData() {
  const formData = new FormData();
  formData.set("slug", "cebu");
  formData.set("name", "Cebu");
  formData.set("region", "Central Visayas");
  formData.set("heroImage", "/destinations/cebu.webp");
  formData.set("heroImageAlt", "A whale shark beneath a snorkeller");
  formData.set("summary", "Island energy and ocean adventures.");
  formData.set("description", "A flexible destination for group programs.");
  formData.set("highlights", "Whale shark encounters\nHeritage experiences");
  formData.set("suitableFor", "FIT, GIT, MICE");
  formData.set("displayOrder", "1");
  formData.set("inquiryDestinationValue", "cebu");
  return formData;
}

function storyFormData() {
  const formData = new FormData();
  formData.set("title", "A successful Cebu program");
  formData.set("storyDate", "2026-08-12");
  formData.set(
    "coverImagePath",
    "2026/22222222-2222-4222-8222-222222222222.webp",
  );
  formData.set("coverImageAlt", "A group of travellers beside the sea");
  formData.set("body", "The team needed a practical island program.");
  return formData;
}

const existingDestination = {
  id: destinationId,
  slug: "cebu",
};
const existingStory = {
  id: storyId,
  slug: "a-successful-cebu-program",
};

describe("admin server action error states", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    authzMock.requireAdmin.mockResolvedValue(undefined);
    destinationDataMock.getAdminDestinationById.mockResolvedValue(
      existingDestination,
    );
    storyDataMock.getAdminStoryById.mockResolvedValue(existingStory);
  });

  it("returns destination parse and save failures instead of throwing", async () => {
    const invalidForm = destinationFormData();
    invalidForm.set("suitableFor", "x".repeat(161));

    await expect(createDestination({ error: "" }, invalidForm)).resolves.toEqual({
      error: "suitableFor values must be 160 characters or fewer.",
    });

    destinationDataMock.createAdminDestination.mockRejectedValueOnce(
      new Error("Creating destination failed: duplicate slug"),
    );

    await expect(
      createDestination({ error: "" }, destinationFormData()),
    ).resolves.toEqual({
      error: "Creating destination failed: duplicate slug",
    });

    destinationDataMock.updateAdminDestination.mockRejectedValueOnce(
      new Error("Updating destination failed: duplicate slug"),
    );

    await expect(
      updateDestination(destinationId, { error: "" }, destinationFormData()),
    ).resolves.toEqual({
      error: "Updating destination failed: duplicate slug",
    });
  });

  it("returns story parse and save failures instead of throwing", async () => {
    const invalidForm = storyFormData();
    invalidForm.set("title", "");

    await expect(createStory({ error: "" }, invalidForm)).resolves.toEqual({
      error: "title is required.",
    });

    storyDataMock.createAdminStory.mockRejectedValueOnce(
      new Error("Creating story failed: duplicate slug"),
    );

    await expect(createStory({ error: "" }, storyFormData())).resolves.toEqual({
      error: "Creating story failed: duplicate slug",
    });

    storyDataMock.updateAdminStory.mockRejectedValueOnce(
      new Error("Updating story failed: duplicate slug"),
    );

    await expect(
      updateStory(storyId, { error: "" }, storyFormData()),
    ).resolves.toEqual({
      error: "Updating story failed: duplicate slug",
    });
  });
});
