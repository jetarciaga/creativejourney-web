import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ArrowRight, Check } from "lucide-react";
import Button from "@/components/Button";
import Container from "@/components/Container";
import Icon from "@/components/Icon";
import PageHeader from "@/components/PageHeader";
import Section from "@/components/Section";
import { getDestinationBySlug, listDestinations } from "@/lib/destinations";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 300;

const getCachedDestination = cache((slug: string) => getDestinationBySlug(slug));

export async function generateStaticParams() {
  const destinations = await listDestinations();
  return destinations.map((destination) => ({ slug: destination.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const destination = await getCachedDestination(slug);

  if (!destination) {
    return { title: "Destination not found" };
  }

  const title = destination.name + " — Creative Journeys Travel PH";
  const url = absoluteUrl("/destinations/" + destination.slug);

  return {
    title,
    description: destination.summary,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title,
      description: destination.summary,
      url,
      images: [{ url: absoluteUrl(destination.heroImage) }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: destination.summary,
      images: [absoluteUrl(destination.heroImage)],
    },
  };
}

export default async function DestinationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const destination = await getCachedDestination(slug);

  if (!destination) {
    notFound();
  }

  return (
    <>
      <PageHeader
        eyebrow={destination.region}
        title={destination.name}
        description={destination.summary}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button href={"/contact?destination=" + destination.slug}>
            Discuss this destination <span aria-hidden="true">→</span>
          </Button>
          <Button href="/destinations" variant="secondary">
            All destinations
          </Button>
        </div>
      </PageHeader>

      <section className="py-12 sm:py-16">
        <Container>
          <div className="relative aspect-[16/8] overflow-hidden rounded-card border border-border bg-surface shadow-site">
            {destination.heroImage.startsWith("/") ? (
              <Image
                src={destination.heroImage}
                alt={destination.heroImageAlt}
                fill
                priority
                sizes="(min-width: 1024px) 1200px, 100vw"
                className="object-cover"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={destination.heroImage}
                alt={destination.heroImageAlt}
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
          </div>
        </Container>
      </section>

      <Section
        eyebrow="Built around the brief"
        title="A flexible starting point for thoughtful travel."
        description={destination.description}
      >
        <div className="grid gap-5 md:grid-cols-2">
          <article className="rounded-card border border-border bg-surface p-6">
            <h2 className="font-display text-2xl font-semibold text-text">
              Highlights
            </h2>
            <ul className="mt-6 space-y-4">
              {destination.highlights.map((highlight) => (
                <li className="flex gap-3 text-sm text-text" key={highlight}>
                  <Icon className="shrink-0 text-accent" icon={Check} size={18} />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </article>
          <article className="rounded-card border border-border bg-surface p-6">
            <h2 className="font-display text-2xl font-semibold text-text">
              Suitable for
            </h2>
            <ul className="mt-6 space-y-4">
              {destination.suitableFor.map((program) => (
                <li className="flex gap-3 text-sm text-text" key={program}>
                  <Icon className="shrink-0 text-accent" icon={ArrowRight} size={18} />
                  <span>{program} programs</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </Section>

      <section className="border-t border-border py-12 sm:py-16">
        <Container className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">Ready to shape the details?</p>
          <Link
            className="inline-flex min-h-[var(--site-tap-min)] items-center gap-2 text-sm font-semibold text-link underline decoration-transparent transition hover:text-accent hover:decoration-current"
            href={"/contact?destination=" + destination.slug}
          >
            Tell us what you are planning <Icon icon={ArrowRight} size={17} />
          </Link>
        </Container>
      </section>
    </>
  );
}
