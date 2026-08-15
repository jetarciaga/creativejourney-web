import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Card from "@/components/Card";
import Icon from "@/components/Icon";
import type { services } from "@/lib/content";

type Service = (typeof services)[number];

export default function ServiceCard({ service }: { service: Service }) {
  return (
    <Card className="group flex h-full flex-col p-6 transition duration-200 hover:-translate-y-1 hover:shadow-site-strong sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <p className="font-sans text-sm font-bold tracking-[0.14em] text-accent">{service.acronym}</p>
        <Icon icon={ArrowUpRight} className="text-muted transition duration-200 group-hover:text-accent" />
      </div>
      <h3 className="mt-8 font-display text-2xl font-semibold tracking-tight text-text">{service.title}</h3>
      <p className="mt-4 text-sm leading-relaxed text-muted">{service.description}</p>
      <ul className="mt-6 space-y-3 border-t border-border pt-5 text-sm text-text">
        {service.bullets.map((bullet) => (
          <li key={bullet} className="flex gap-3">
            <span aria-hidden="true" className="mt-[0.65em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-fill" />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
      <Link href={service.href} className="mt-auto pt-8 text-sm font-semibold text-link underline decoration-transparent transition hover:text-accent hover:decoration-current">
        Explore {service.acronym} <span aria-hidden="true">→</span>
      </Link>
    </Card>
  );
}
