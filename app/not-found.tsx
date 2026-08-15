import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] items-center py-20" aria-labelledby="not-found-title">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        <p className="eyebrow">404</p>
        <h1 id="not-found-title" className="mt-4 font-display text-5xl font-semibold tracking-tight text-text sm:text-6xl">That page took a different route.</h1>
        <p className="mt-5 max-w-xl text-lg text-muted">The link may be out of date, but we can still help you find the right starting point.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link href="/" className="inline-flex min-h-[var(--site-tap-min)] items-center justify-center rounded-md bg-accent-fill px-5 py-3 text-sm font-semibold !text-white">Back to home</Link><Link href="/contact" className="inline-flex min-h-[var(--site-tap-min)] items-center justify-center rounded-md border border-border-strong px-5 py-3 text-sm font-semibold text-text hover:border-accent hover:text-accent">Contact our team</Link></div>
      </div>
    </section>
  );
}
