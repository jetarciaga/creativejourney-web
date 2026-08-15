import type { Metadata } from "next";
import Button from "@/components/Button";
import DestinationCard from "@/components/DestinationCard";
import HeroCarousel from "@/components/HeroCarousel";
import JsonLd from "@/components/JsonLd";
import QuoteBand from "@/components/QuoteBand";
import Section from "@/components/Section";
import ServiceCard from "@/components/ServiceCard";
import TrustBar from "@/components/TrustBar";
import { destinations, services } from "@/lib/content";
import { metadataForRoute } from "@/lib/seo";
import { absoluteUrl, SITE } from "@/lib/site";

export function generateMetadata(): Metadata {
  return metadataForRoute("/");
}

export default function Page() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "TravelAgency",
              "@id": `${absoluteUrl("/")}#agency`,
              name: SITE.name,
              url: absoluteUrl("/"),
              logo: absoluteUrl("/icon.svg"),
              description: SITE.description,
              email: SITE.email,
              telephone: SITE.whatsapp,
              address: {
                "@type": "PostalAddress",
                streetAddress: "#4 San Guillermo Street, Brgy. Bayanan",
                addressLocality: "Muntinlupa City",
                addressCountry: "PH",
              },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") }],
            },
          ],
        }}
      />
      <HeroCarousel />
      <TrustBar />

      <Section
        id="services"
        eyebrow="Travel programs with a point of view"
        title="A partner for the parts of travel that need more care."
        description="From an independent itinerary to a multi-day corporate program, we bring the local knowledge and operational detail that make the experience feel effortless."
      >
        <div className="grid gap-5 lg:grid-cols-3">
          {services.map((service) => <ServiceCard key={service.id} service={service} />)}
        </div>
      </Section>

      <Section
        id="destinations"
        tone="surface"
        eyebrow="Where we can take you"
        title="Strong starting points. Flexible by design."
        description="Use these destinations as a starting point, then let’s shape the pace, detail, and purpose around your travellers."
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((destination) => <DestinationCard key={destination.slug} destination={destination} />)}
        </div>
        <div className="mt-8">
          <Button href="/contact" variant="secondary">Tell us where you want to go</Button>
        </div>
      </Section>

      <Section
        id="how-we-work"
        eyebrow="How we work"
        title="A clear path from first idea to final detail."
        description="You bring the objective. We bring the questions, options, and coordination that turn it into a program people can trust."
      >
        <div className="grid gap-5 md:grid-cols-3">
          {[
            ["01", "Listen to the brief", "We start with the people, purpose, dates, and decisions that matter."],
            ["02", "Shape the program", "We build a practical route with considered options and transparent trade-offs."],
            ["03", "Handle the moving parts", "We coordinate the details so your travellers can focus on the experience."],
          ].map(([number, title, description]) => (
            <article key={number} className="border-t-2 border-accent-fill pt-5">
              <p className="font-sans text-xs font-bold text-accent">{number}</p>
              <h3 className="mt-6 font-display text-xl font-semibold text-text">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{description}</p>
            </article>
          ))}
        </div>
      </Section>

      <QuoteBand />
    </>
  );
}
