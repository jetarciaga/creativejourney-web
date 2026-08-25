"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import Container from "@/components/Container";
import Icon from "@/components/Icon";
import ThemeToggle from "@/components/ThemeToggle";
import useMounted from "@/lib/use-mounted";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/stories", label: "Stories" },
  { href: "/partners", label: "Partners" },
  { href: "/contact", label: "Contact" },
] as const;

function NavItems({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const hoveredHref = useRef<string | null>(null);
  const currentPath = pathname ?? "/";
  const activeHref = navItems.find((item) =>
    item.href === "/" ? currentPath === "/" : currentPath.startsWith(item.href),
  )?.href ?? "/";

  const moveIndicator = useCallback((href: string) => {
    const nav = navRef.current;
    const indicator = indicatorRef.current;
    const link = linkRefs.current[href];

    if (!nav || !indicator || !link) return;

    const navBounds = nav.getBoundingClientRect();
    const linkBounds = link.getBoundingClientRect();
    indicator.style.width = `${linkBounds.width}px`;
    indicator.style.transform = `translateX(${linkBounds.left - navBounds.left}px)`;
    indicator.style.opacity = "1";
  }, []);

  const highlight = useCallback((href: string) => {
    hoveredHref.current = href;
    moveIndicator(href);
  }, [moveIndicator]);

  const restoreActive = useCallback(() => {
    hoveredHref.current = null;
    moveIndicator(activeHref);
  }, [activeHref, moveIndicator]);

  useLayoutEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      moveIndicator(hoveredHref.current ?? activeHref);
    });
    const handleResize = () => moveIndicator(hoveredHref.current ?? activeHref);

    window.addEventListener("resize", handleResize);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);
    };
  }, [activeHref, moveIndicator]);

  return (
    <div
      ref={navRef}
      className={cn("relative flex h-full items-center", mobile && "block h-auto")}
      onPointerLeave={restoreActive}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          restoreActive();
        }
      }}
    >
      <ul className={cn("flex items-center gap-6", mobile && "flex-col items-stretch gap-0")}>
        {navItems.map((item) => {
          const active = item.href === "/" ? currentPath === "/" : currentPath.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                ref={(node) => {
                  linkRefs.current[item.href] = node;
                }}
                href={item.href}
                onClick={onNavigate}
                onFocus={() => highlight(item.href)}
                onPointerEnter={() => highlight(item.href)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "nav-link block min-h-[var(--site-tap-min)] py-3 text-sm font-semibold text-muted transition duration-200 hover:text-accent",
                  mobile && "border-b border-border px-4",
                  active && "text-accent",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
      {mobile ? null : <span ref={indicatorRef} aria-hidden="true" className="nav-indicator" />}
    </div>
  );
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();
  const logoSrc = mounted && resolvedTheme === "dark"
    ? "/brand/logo-wordmark-dark.png"
    : "/brand/logo-wordmark-light.png";

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-header-border bg-bg/95 backdrop-blur">
      <Container className="flex min-h-20 items-center justify-between gap-6">
        <Link href="/" className="group shrink-0" aria-label="Creative Journeys Travel PH home">
          <Image
            src={logoSrc}
            alt=""
            width={205}
            height={27}
            priority
            className="h-auto w-[180px] sm:w-[205px]"
          />
        </Link>

        <nav aria-label="Primary navigation" className="hidden self-stretch lg:flex">
          <NavItems />
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/contact"
            className="hidden min-h-[var(--site-tap-min)] items-center rounded-md bg-accent-fill px-4 py-2 text-sm font-semibold !text-white transition duration-200 hover:bg-green-700 lg:inline-flex"
          >
            Get a quote
          </Link>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-surface text-text lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Icon icon={menuOpen ? X : Menu} size={20} />
          </button>
        </div>
      </Container>

      {menuOpen ? (
        <div id="mobile-navigation" className="border-t border-border bg-bg lg:hidden">
          <Container className="py-2">
            <nav aria-label="Mobile navigation">
              <NavItems mobile onNavigate={() => setMenuOpen(false)} />
            </nav>
            <Link
              href="/contact"
              onClick={() => setMenuOpen(false)}
              className="my-3 flex min-h-[var(--site-tap-min)] items-center justify-center rounded-md bg-accent-fill px-4 py-3 text-sm font-semibold !text-white"
            >
              Get a quote
            </Link>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
