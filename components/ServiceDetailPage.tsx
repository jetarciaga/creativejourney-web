import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import Button from "@/components/Button";
import Container from "@/components/Container";
import Icon from "@/components/Icon";
import PageHeader from "@/components/PageHeader";
import QuoteBand from "@/components/QuoteBand";
import Section from "@/components/Section";
import type { Service } from "@/lib/content";

export default function ServiceDetailPage({ service }: { service: Service }) {
  return (
    <>
      <PageHeader eyebrow={`${service.acronym} travel programs`} title={service.title} description={service.description}>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button href="/contact">Discuss your brief <span aria-hidden="true">→</span></Button>
          <Button href="/services" variant="secondary">All services</Button>
        </div>
      </PageHeader>

      <Section
        eyebrow="Built around the brief"
        title="The right level of detail, without the noise."
        description="A good travel program gives people confidence before they leave and gives the organiser a clear path while they’re on the ground."
      >
        <div className="grid gap-5 md:grid-cols-3">
          {service.bullets.map((bullet, index) => (
            <article key={bullet} className="rounded-card border border-border bg-surface p-6">
              <p className="font-sans text-xs font-bold text-accent">0{index + 1}</p>
              <h3 className="mt-8 font-display text-xl font-semibold text-text">{bullet}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">Clear ownership and practical coordination from the first outline to the final movement.</p>
            </article>
          ))}
        </div>
      </Section>

      <section className="border-y border-border bg-surface py-16 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="eyebrow">A practical partner</p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-text">What working together feels like</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {[
              "A concise starting brief",
              "Options shaped around your priorities",
              "One team coordinating the moving parts",
              "A program you can explain to your travellers or client",
            ].map((item) => (
              <div key={item} className="flex gap-3 rounded-md border border-border bg-bg p-5 text-sm text-text">
                <Icon icon={Check} className="shrink-0 text-accent" size={18} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-14 sm:py-16">
        <Container className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">Looking for another kind of program?</p>
          <Link href="/services" className="inline-flex min-h-[var(--site-tap-min)] items-center gap-2 text-sm font-semibold text-link underline decoration-transparent transition hover:text-accent hover:decoration-current">Compare our services <Icon icon={ArrowRight} size={17} /></Link>
        </Container>
      </section>

      <QuoteBand />
    </>
  );
}
