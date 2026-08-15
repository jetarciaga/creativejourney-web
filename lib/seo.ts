// Per-route SEO/OG metadata registry.
//
// Deliberately has no import from "next" beyond the erased-at-compile-time
// `Metadata` type — no next/font, no server-only APIs — so this module can
// be imported directly by Vitest (test/phase0/seo-metadata.test.ts)
// without going through Next's build pipeline, the way next/font requires.
//
// index.html carried these tags before the rebuild (title, description,
// canonical, og:*, twitter:*) for a single route, because the pre-rebuild
// site was a client-rendered SPA and the head was all a crawler ever got.
// This registry is that same content, made per-route.
import type { Metadata } from "next";
import { SITE, absoluteUrl } from "./site";

export { SITE, absoluteUrl };

type RouteMeta = {
  title: string;
  description: string;
  openGraph: {
    title: string;
    description: string;
    url: string;
    images: { url: string; width: number; height: number }[];
  };
  twitter: {
    card: "summary_large_image";
    title: string;
    description: string;
    images: string[];
  };
};

function buildRouteMeta(path: string, title: string, description: string): RouteMeta {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      images: [{ url: absoluteUrl(SITE.ogImage), width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl(SITE.ogImage)],
    },
  };
}

const TITLE_SUFFIX = "Creative Journeys Travel PH";

export const routeMetadata: Record<string, RouteMeta> = {
  "/": buildRouteMeta(
    "/",
    `${TITLE_SUFFIX} — FIT, GIT & MICE Travel Specialists`,
    SITE.description,
  ),
  "/about": buildRouteMeta(
    "/about",
    `About Us — ${TITLE_SUFFIX}`,
    "A Philippine wholesaler travel agency crafting personalized FIT, GIT, and MICE travel programs since 2017.",
  ),
  "/contact": buildRouteMeta(
    "/contact",
    `Contact & Get a Quote — ${TITLE_SUFFIX}`,
    "Tell us about your trip and we'll respond with a tailored, worry-free travel quote.",
  ),
  "/privacy": buildRouteMeta(
    "/privacy",
    `Privacy Policy — ${TITLE_SUFFIX}`,
    "How Creative Journeys Travel PH collects, uses, and protects personal information under the Philippine Data Privacy Act (RA 10173).",
  ),
  "/services": buildRouteMeta(
    "/services",
    `Services — FIT, GIT & MICE — ${TITLE_SUFFIX}`,
    "Free Independent Traveler, Group Incentive Travel, and Meetings, Incentives, Conferences & Events programs, built to fit your group.",
  ),
  "/services/fit": buildRouteMeta(
    "/services/fit",
    `FIT — Free Independent Traveler Packages — ${TITLE_SUFFIX}`,
    "Personalized independent travel itineraries across the Philippines and beyond, built around your dates and budget.",
  ),
  "/services/git": buildRouteMeta(
    "/services/git",
    `GIT — Group Incentive Travel — ${TITLE_SUFFIX}`,
    "Group and incentive travel programs handled end to end, from itinerary design to on-ground logistics.",
  ),
  "/services/mice": buildRouteMeta(
    "/services/mice",
    `MICE — Meetings, Incentives, Conferences & Events — ${TITLE_SUFFIX}`,
    "Corporate meetings, incentive trips, conferences, and events planned and executed by a wholesaler travel partner.",
  ),
  "/partners": buildRouteMeta(
    "/partners",
    `Partner With Us — ${TITLE_SUFFIX}`,
    "Net rates, commission structure, and booking access for retail travel agents partnering with Creative Journeys Travel PH.",
  ),
};

export function metadataForRoute(path: string): Metadata {
  const meta = routeMetadata[path] ?? routeMetadata["/"];
  if (!meta) throw new Error("The root route metadata is missing");

  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: meta.openGraph.url },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      title: meta.openGraph.title,
      description: meta.openGraph.description,
      url: meta.openGraph.url,
      images: meta.openGraph.images,
    },
    twitter: {
      card: "summary_large_image",
      title: meta.twitter.title,
      description: meta.twitter.description,
      images: meta.twitter.images,
    },
  };
}
