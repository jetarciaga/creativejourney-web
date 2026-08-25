"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin/destinations", label: "Destinations" },
  { href: "/admin/stories", label: "Stories" },
] as const;

export function AdminNav() {
  const pathname = usePathname() ?? "/admin";

  return (
    <nav aria-label="Admin sections" className="mt-4 flex gap-5 text-sm">
      {items.map((item) => {
        const active = pathname.startsWith(item.href);

        return (
          <Link
            className={
              active
                ? "border-b-2 border-accent pb-2 font-semibold text-text"
                : "border-b-2 border-transparent pb-2 font-semibold text-muted transition hover:border-accent hover:text-accent"
            }
            href={item.href}
            key={item.href}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
