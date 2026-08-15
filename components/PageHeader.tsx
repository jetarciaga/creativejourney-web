import type { ReactNode } from "react";
import Container from "@/components/Container";

export default function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="surface-grid border-b border-border bg-surface py-16 sm:py-20 lg:py-24">
      <Container>
        <div className="max-w-4xl">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-4 max-w-4xl font-display text-4xl font-semibold tracking-tight text-text sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <div className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            {description}
          </div>
          {children ? <div className="mt-8">{children}</div> : null}
        </div>
      </Container>
    </section>
  );
}
