import type { Metadata } from "next";
import Image from "next/image";
import Button from "@/components/Button";
import Container from "@/components/Container";
import PageHeader from "@/components/PageHeader";
import QuoteBand from "@/components/QuoteBand";
import Section from "@/components/Section";
import { metadataForRoute } from "@/lib/seo";
import { FOUNDED_YEAR, yearsInBusiness } from "@/lib/site";

export function generateMetadata(): Metadata {
  return metadataForRoute("/about");
}

export default function Page() {
  return (
    <>
      <PageHeader
        eyebrow="About Creative Journeys"
        title="A local team for journeys that need to feel considered."
        description={<>We are a Philippine wholesaler travel agency crafting tailored FIT, GIT, and MICE programs for travellers, companies, and the partners who serve them.</>}
      >
        <Button href="/contact">Talk to our team <span aria-hidden="true">→</span></Button>
      </PageHeader>

      <section className="py-14 sm:py-20 lg:py-24">
        <Container className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-surface shadow-site">
            <Image src="/about/team.webp" alt="The Creative Journeys team in the Philippines" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" priority />
          </div>
          <div className="max-w-2xl">
            <p className="eyebrow">Built on experience</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-text sm:text-4xl">The details matter because the people do.</h2>
            <p className="mt-5 text-base leading-relaxed text-muted">Since {FOUNDED_YEAR}, Creative Journeys has helped shape travel experiences that balance the excitement of discovery with the reassurance of good planning. Our work sits between local knowledge and the expectations of the people travelling.</p>
            <p className="mt-4 text-base leading-relaxed text-muted">That means asking better questions early, giving partners workable options, and staying close to the moving parts until the journey is complete.</p>
            <div className="mt-8 flex items-baseline gap-3 border-t border-border pt-6"><span className="font-display text-4xl font-semibold text-accent">{yearsInBusiness()}+</span><span className="text-sm text-muted">years of travel-program experience</span></div>
          </div>
        </Container>
      </section>

      <Section eyebrow="What guides us" title="A useful combination of care and capability." description="We want every partner and traveller to feel that the program has been thought through—not simply passed along.">
        <div className="grid gap-6 md:grid-cols-2">
          <article className="grid overflow-hidden rounded-card border border-border bg-surface md:grid-cols-[0.9fr_1.1fr]">
            <div className="relative min-h-64"><Image src="/about/underwater.webp" alt="A swimmer exploring clear Philippine water" fill sizes="(min-width: 768px) 30vw, 100vw" className="object-cover" /></div>
            <div className="p-6 sm:p-8"><p className="font-sans text-xs font-bold uppercase tracking-[0.14em] text-accent">Our mission</p><h3 className="mt-4 font-display text-2xl font-semibold text-text">Make thoughtful travel easier to deliver.</h3><p className="mt-4 text-sm leading-relaxed text-muted">We transform travel goals into practical, personal programs through expertise, responsiveness, and close attention to the details that shape the experience.</p></div>
          </article>
          <article className="grid overflow-hidden rounded-card border border-border bg-surface md:grid-cols-[0.9fr_1.1fr]">
            <div className="relative min-h-64"><Image src="/about/tarsier.webp" alt="A Philippine tarsier resting on a branch" fill sizes="(min-width: 768px) 30vw, 100vw" className="object-cover" /></div>
            <div className="p-6 sm:p-8"><p className="font-sans text-xs font-bold uppercase tracking-[0.14em] text-accent">Our vision</p><h3 className="mt-4 font-display text-2xl font-semibold text-text">Be the partner people trust with the complicated parts.</h3><p className="mt-4 text-sm leading-relaxed text-muted">We are building a destination-management partner known for clear communication, inventive solutions, and service that stays steady under pressure.</p></div>
          </article>
        </div>
      </Section>

      <QuoteBand title="Let’s build something your travellers will remember for the right reasons." />
    </>
  );
}
