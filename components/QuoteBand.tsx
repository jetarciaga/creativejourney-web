import Link from "next/link";
import Container from "@/components/Container";

export default function QuoteBand({
  title = "Let’s make the next journey easier to say yes to.",
  description = "Share the shape of your trip, group, or event. We’ll help turn the brief into a workable program.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className="bg-ink-900 py-16 text-white sm:py-20">
      <Container className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow text-green-400">Start a conversation</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
          <p className="mt-4 text-base leading-relaxed text-ink-100 sm:text-lg">{description}</p>
        </div>
        <Link href="/contact" className="inline-flex min-h-[var(--site-tap-min)] shrink-0 items-center justify-center rounded-md bg-accent-fill px-5 py-3 text-sm font-semibold !text-white transition hover:bg-green-700">
          Get a tailored quote <span aria-hidden="true" className="ml-2">→</span>
        </Link>
      </Container>
    </section>
  );
}
