import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Card from "@/components/Card";
import Icon from "@/components/Icon";
import type { destinations } from "@/lib/content";

type Destination = (typeof destinations)[number];

export default function DestinationCard({ destination }: { destination: Destination }) {
  return (
    <Card className="group overflow-hidden transition duration-200 hover:-translate-y-1 hover:shadow-site-strong">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={destination.image}
          alt={destination.alt}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-5 sm:p-6">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.12em] text-accent">{destination.region}</p>
        <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-text">{destination.name}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted">{destination.summary}</p>
        <Link href={`/contact?destination=${destination.slug}`} className="mt-5 inline-flex min-h-[var(--site-tap-min)] items-center gap-2 text-sm font-semibold text-link underline decoration-transparent transition hover:text-accent hover:decoration-current">
          Build a program <Icon icon={ArrowUpRight} size={17} />
        </Link>
      </div>
    </Card>
  );
}
