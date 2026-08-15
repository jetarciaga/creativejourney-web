import type { Metadata } from "next";
import Button from "@/components/Button";
import Container from "@/components/Container";
import PageHeader from "@/components/PageHeader";
import QuoteBand from "@/components/QuoteBand";
import Section from "@/components/Section";
import { metadataForRoute } from "@/lib/seo";
import { SITE } from "@/lib/site";

export function generateMetadata(): Metadata {
  return metadataForRoute("/partners");
}

export default function Page() {
  return (
    <>
      <PageHeader eyebrow="For retail travel partners" title="A dependable Philippine product partner behind your client relationship." description="We help retail agents sell with confidence through local knowledge, workable net-rate programs, and responsive ground support.">
        <Button href={`mailto:${SITE.email}?subject=Partner%20registration`}>Register your interest <span aria-hidden="true">→</span></Button>
      </PageHeader>
      <Section eyebrow="Why partner with us" title="You keep the relationship. We strengthen the delivery." description="Creative Journeys works behind the scenes so your client receives a polished, well-supported program that still feels like your service.">
        <div className="grid gap-5 md:grid-cols-3">{[
          ["Local product knowledge", "Practical advice on routes, suppliers, pacing, and what works on the ground."],
          ["Net-rate programs", "We prepare a clear program quote for the brief, market, and service level you need."],
          ["Responsive coordination", "A reachable partner before departure and while the program is in motion."],
        ].map(([title, description]) => <article key={title} className="rounded-card border border-border bg-surface p-6 sm:p-7"><h2 className="font-display text-xl font-semibold text-text">{title}</h2><p className="mt-3 text-sm leading-relaxed text-muted">{description}</p></article>)}</div>
      </Section>
      <section className="border-y border-border bg-surface py-16 sm:py-20"><Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]"><div><p className="eyebrow">How it works</p><h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-text">A simple path from enquiry to confirmation.</h2></div><ol className="space-y-5">{["Send us the client brief and travel parameters.", "We shape options, inclusions, and a net-rate proposal.", "You present the program to your client with your own service relationship.", "We coordinate the confirmed ground arrangements together."].map((step, index) => <li key={step} className="flex gap-4 border-b border-border pb-5 text-sm text-text"><span className="font-sans text-xs font-bold text-accent">0{index + 1}</span><span>{step}</span></li>)}</ol></Container></section>
      <Section eyebrow="Current terms" title="Let’s discuss the right partnership model." description="Commission and net-rate terms depend on the market, product, season, and level of support. We share the current structure when we understand the kind of business you want to build with us."><Button href={`mailto:${SITE.email}?subject=Creative%20Journeys%20partner%20enquiry`}>Ask about partner terms</Button></Section>
      <QuoteBand title="Give your clients more of the Philippines—with a partner behind you." />
    </>
  );
}
