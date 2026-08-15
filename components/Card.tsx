import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export default function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <article className={cn("rounded-card border border-border bg-surface shadow-site", className)}>
      {children}
    </article>
  );
}
