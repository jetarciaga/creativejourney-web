import type { Metadata } from "next";
import Button from "@/components/Button";
import Card from "@/components/Card";
import Container from "@/components/Container";
import PageHeader from "@/components/PageHeader";
import { metadataForRoute } from "@/lib/seo";
import { SITE } from "@/lib/site";

export function generateMetadata(): Metadata {
  return metadataForRoute("/contact");
}

export default function Page() {
  return (
    <>
      <PageHeader eyebrow="Let’s talk travel" title="Tell us what you’re planning." description="A few useful details are enough to start. Share the destination, dates, people, and purpose, and we’ll come back with the right next questions.">
        <Button href={`mailto:${SITE.email}`}>Email our team <span aria-hidden="true">→</span></Button>
      </PageHeader>
      <section className="py-16 sm:py-20 lg:py-24">
        <Container className="grid gap-6 lg:grid-cols-3">
          <Card className="p-6 sm:p-8"><p className="eyebrow">Email</p><h2 className="mt-4 font-display text-2xl font-semibold text-text">Start with the brief.</h2><p className="mt-3 text-sm leading-relaxed text-muted">Send your initial requirements and our team will help shape the next step.</p><a href={`mailto:${SITE.email}`} className="mt-6 inline-block break-all text-sm font-semibold text-link underline decoration-transparent hover:text-accent hover:decoration-current">{SITE.email}</a></Card>
          <Card className="p-6 sm:p-8"><p className="eyebrow">WhatsApp</p><h2 className="mt-4 font-display text-2xl font-semibold text-text">A quick question?</h2><p className="mt-3 text-sm leading-relaxed text-muted">Message us for a quick conversation about a route, group, or event.</p><a href={`https://wa.me/${SITE.whatsapp.replace("+", "")}`} target="_blank" rel="noreferrer" className="mt-6 inline-block text-sm font-semibold text-link underline decoration-transparent hover:text-accent hover:decoration-current">{SITE.whatsappDisplay}</a></Card>
          <Card className="p-6 sm:p-8"><p className="eyebrow">Our base</p><h2 className="mt-4 font-display text-2xl font-semibold text-text">Muntinlupa City</h2><p className="mt-3 text-sm leading-relaxed text-muted">{SITE.address}</p><Button href="/about" variant="quiet" className="mt-5 px-0">More about us <span aria-hidden="true">→</span></Button></Card>
        </Container>
      </section>
      <section className="border-y border-border bg-surface py-12"><Container className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><p className="max-w-xl text-sm leading-relaxed text-muted">The inquiry form is the next phase of the rebuild. For now, email or WhatsApp gives us the clearest starting point.</p><Button href={`mailto:${SITE.email}?subject=Travel%20program%20enquiry`}>Send a travel enquiry</Button></Container></section>
    </>
  );
}
