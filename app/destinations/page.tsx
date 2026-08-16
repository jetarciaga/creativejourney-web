import type { Metadata } from "next";
import DestinationCard from "@/components/DestinationCard";
import PageHeader from "@/components/PageHeader";
import Section from "@/components/Section";
import { listDestinations } from "@/lib/destinations";
import { metadataForRoute } from "@/lib/seo";

export const revalidate = 300;

export function generateMetadata(): Metadata {
  return metadataForRoute("/destinations");
}

export default async function DestinationsPage() {
  const destinations = await listDestinations();

  return (
    <>
      <PageHeader
        eyebrow="Where we can take you"
        title="Destinations with room to make the program your own."
        description="Start with a strong destination, then shape the pace, detail, and purpose around your travellers."
      />
      <Section
        title="Our current starting points"
        description="These destinations are the foundation for flexible FIT, GIT, and MICE programs."
      >
        {destinations.length === 0 ? (
          <p className="border-t border-border pt-6 text-muted">
            Destinations are being refreshed. Tell us where you want to go and we will help shape the brief.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {destinations.map((destination) => (
              <DestinationCard destination={destination} key={destination.id} />
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
