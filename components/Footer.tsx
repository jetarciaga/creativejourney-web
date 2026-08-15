import Image from "next/image";
import Link from "next/link";
import Container from "@/components/Container";
import { SITE } from "@/lib/site";

const serviceLinks = [
  { href: "/services/fit", label: "FIT travel" },
  { href: "/services/git", label: "GIT programs" },
  { href: "/services/mice", label: "MICE events" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-ink-900 text-white">
      <Container className="grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr] lg:py-16">
        <div>
          <Link href="/" aria-label="Creative Journeys Travel PH home">
            <Image
              src="/brand/logo-full-dark.png"
              alt="Creative Journeys Travel PH"
              width={250}
              height={48}
              className="h-auto w-[250px]"
            />
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-100">
            Philippine travel programs designed with care for independent travellers, groups, corporate teams, and retail travel partners.
          </p>
          <div className="mt-6 flex items-center gap-4 text-sm text-ink-100">
            <a href={SITE.facebook} target="_blank" rel="noreferrer" className="transition hover:text-green-400">
              Facebook<span className="sr-only"> (opens in a new tab)</span>
            </a>
            <a href={SITE.linkedin} target="_blank" rel="noreferrer" className="transition hover:text-green-400">
              LinkedIn<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </div>

        <div>
          <h2 className="font-sans text-xs font-bold uppercase tracking-[0.14em] text-green-400">Explore</h2>
          <ul className="mt-4 space-y-3 text-sm text-ink-100">
            <li><Link className="transition hover:text-green-400" href="/about">About us</Link></li>
            <li><Link className="transition hover:text-green-400" href="/services">Services</Link></li>
            <li><Link className="transition hover:text-green-400" href="/partners">Travel partners</Link></li>
            <li><Link className="transition hover:text-green-400" href="/privacy">Privacy policy</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="font-sans text-xs font-bold uppercase tracking-[0.14em] text-green-400">Work with us</h2>
          <ul className="mt-4 space-y-3 text-sm text-ink-100">
            {serviceLinks.map((link) => <li key={link.href}><Link className="transition hover:text-green-400" href={link.href}>{link.label}</Link></li>)}
            <li><a className="transition hover:text-green-400" href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
            <li><a className="transition hover:text-green-400" href={`https://wa.me/${SITE.whatsapp.replace("+", "")}`} target="_blank" rel="noreferrer">WhatsApp</a></li>
          </ul>
        </div>
      </Container>
      <div className="border-t border-white/15">
        <Container className="flex flex-col gap-2 py-5 text-xs text-ink-100 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Creative Journeys Travel PH</p>
          <p>{SITE.location}</p>
        </Container>
      </div>
    </footer>
  );
}
