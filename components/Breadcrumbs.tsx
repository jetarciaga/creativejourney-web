import Link from "next/link";
import Container from "@/components/Container";
import { absoluteUrl } from "@/lib/site";
import JsonLd from "@/components/JsonLd";

export type BreadcrumbItem = { label: string; href?: string };

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href ? absoluteUrl(item.href) : absoluteUrl("/"),
    })),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <Container>
        <nav aria-label="Breadcrumb" className="pt-6 text-xs text-muted">
          <ol className="flex flex-wrap items-center gap-2">
            {items.map((item, index) => (
              <li key={`${item.label}-${index}`} className="flex items-center gap-2">
                {index > 0 ? <span aria-hidden="true">/</span> : null}
                {item.href ? (
                  <Link href={item.href} className="underline decoration-transparent transition hover:text-accent hover:decoration-current">
                    {item.label}
                  </Link>
                ) : (
                  <span aria-current="page">{item.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </Container>
    </>
  );
}
