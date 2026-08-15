// Mirrors the portfolio's lib/site.ts pattern: a single SITE_URL resolved
// from the Vercel-provided env var in production, an explicit override for
// local/preview, and a hardcoded fallback so the module never throws.
const configuredVercelUrl =
  process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
const configuredSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (configuredVercelUrl
    ? `https://${configuredVercelUrl}`
    : "https://www.creativejourneysph.com");

export const SITE_URL = new URL(configuredSiteUrl);

export function absoluteUrl(pathname: string) {
  return new URL(pathname, SITE_URL).toString();
}

// The trust bar still needs a conservative rounded client/group figure from
// the site owner. Nothing renders it yet; add the value here when confirmed.
export const FOUNDED_YEAR = 2017;

// Keep this nullable until the conservative rounded figure is confirmed.
// The home trust bar has a non-quantified fallback so the layout never
// invents a credential or a client count.
export const TRUSTED_CLIENT_GROUPS: number | null = null;

export function yearsInBusiness(asOf: Date = new Date()): number {
  return asOf.getUTCFullYear() - FOUNDED_YEAR;
}

export const SITE = {
  name: "Creative Journeys Travel PH",
  shortName: "Creative Journeys",
  url: SITE_URL.origin,
  description:
    "Creative Journeys Travel PH is a Philippine wholesaler travel agency crafting personalized FIT, GIT, and MICE travel programs. Get a worry-free, tailored travel quote.",
  location: "Muntinlupa City, Philippines",
  address: "#4 San Guillermo Street, Brgy. Bayanan, Muntinlupa City, Philippines",
  email: "hello@creativejourneysph.com",
  whatsapp: "+639989629055",
  whatsappDisplay: "+63 998 9629 055",
  facebook: "https://www.facebook.com/creativejourneysph",
  linkedin: "https://www.linkedin.com/in/creativejourneysph/",
  ogImage: "/og-image.jpg",
} as const;
