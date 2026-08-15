import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { routeMetadata } from "@/lib/seo";

// Generated from the same route registry every other route-aware test
// checks against (lib/seo.ts), so it cannot drift the way the hand
// maintained public/sitemap.xml did — that file only ever listed 3 of the
// site's routes (P0-6).
export default function sitemap(): MetadataRoute.Sitemap {
  const priorities: Record<string, number> = {
    "/": 1.0,
    "/contact": 0.9,
    "/services": 0.8,
    "/about": 0.7,
    "/partners": 0.7,
  };

  return Object.keys(routeMetadata).map((path) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: priorities[path] ?? 0.6,
  }));
}
