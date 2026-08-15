import type { ReactNode } from "react";
import Container from "@/components/Container";
import { cn } from "@/lib/utils";

type SectionProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
  tone?: "default" | "surface" | "ink";
};

export default function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
  tone = "default",
}: SectionProps) {
  const headingId = id ? `${id}-heading` : undefined;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn(
        "scroll-mt-28 py-16 sm:py-20 lg:py-24",
        tone === "surface" && "bg-surface",
        tone === "ink" && "bg-ink-900 text-white",
        className,
      )}
    >
      <Container>
        <div className="max-w-3xl">
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h2
            id={headingId}
            className={cn(
              "mt-3 font-display text-3xl font-semibold tracking-tight text-text sm:text-4xl",
              tone === "ink" && "text-white",
            )}
          >
            {title}
          </h2>
          {description ? (
            <div
              className={cn(
                "mt-4 max-w-2xl text-base text-muted sm:text-lg",
                tone === "ink" && "text-ink-100",
              )}
            >
              {description}
            </div>
          ) : null}
        </div>
        {children ? <div className="mt-10">{children}</div> : null}
      </Container>
    </section>
  );
}
