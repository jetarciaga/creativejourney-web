import type { Metadata } from "next";
import Button from "@/components/Button";
import PageHeader from "@/components/PageHeader";
import QuoteBand from "@/components/QuoteBand";
import Section from "@/components/Section";
import ServiceCard from "@/components/ServiceCard";
import { services } from "@/lib/content";
import { metadataForRoute } from "@/lib/seo";

export function generateMetadata(): Metadata {
  return metadataForRoute("/services");
}

export default function Page() {
  return (
    <>
      <PageHeader eyebrow="What we do" title="Travel programs that make the moving parts feel manageable." description="We combine destination knowledge, practical coordination, and a clear understanding of your audience to create programs that work in the real world.">
        <Button href="/contact">Tell us what you’re planning <span aria-hidden="true">→</span></Button>
      </PageHeader>
      <Section eyebrow="Three ways to work with us" title="Choose the shape of the program. We’ll help refine the detail." description="Every brief is different. These three service lines are the starting point for how we organise our expertise.">
        <div className="grid gap-5 lg:grid-cols-3">{services.map((service) => <ServiceCard key={service.id} service={service} />)}</div>
      </Section>
      <Section tone="surface" eyebrow="The common thread" title="A partner who stays close to the details." description="Whether the traveller is an individual, a group, or a corporate delegate, the same principles hold: understand the objective, make the choices clear, and keep communication moving.">
        <div className="grid gap-5 sm:grid-cols-3">
          {["Local context", "Clear coordination", "Considered options"].map((title, index) => <article key={title} className="border-t-2 border-accent-fill pt-5"><p className="font-sans text-xs font-bold text-accent">0{index + 1}</p><h3 className="mt-6 font-display text-xl font-semibold text-text">{title}</h3><p className="mt-3 text-sm leading-relaxed text-muted">We keep the program grounded in what travellers, organisers, and partners actually need.</p></article>)}
        </div>
      </Section>
      <QuoteBand />
    </>
  );
}
