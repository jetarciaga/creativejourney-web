import type { MetadataRoute } from "next";
import { listDestinations } from "@/lib/destinations";
import { listStories } from "@/lib/stories";
import { absoluteUrl } from "@/lib/site";
import { routeMetadata } from "@/lib/seo";

// Generated from the same route registry every other route-aware test
// checks against (lib/seo.ts), so it cannot drift the way the hand
// maintained public/sitemap.xml did — that file only ever listed 3 of the
// site's routes (P0-6).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const priorities: Record<string, number> = {
    "/": 1.0,
    "/contact": 0.9,
    "/services": 0.8,
    "/about": 0.7,
    "/partners": 0.7,
  };

  const staticEntries = Object.keys(routeMetadata).map((path) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: priorities[path] ?? 0.6,
  }));

  const destinations = await listDestinations();
  const stories = await listStories();
  return [
    ...staticEntries,
    ...destinations.map((destination) => ({
      url: absoluteUrl("/destinations/" + destination.slug),
      lastModified: new Date(destination.updatedAt),
      changeFrequency: "monthly" as const,
      priority: destination.featured ? 0.8 : 0.6,
    })),
    ...stories.map((story) => ({
      url: absoluteUrl("/stories/" + story.slug),
      lastModified: new Date(story.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
