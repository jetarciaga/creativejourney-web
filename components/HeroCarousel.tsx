"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";
import Container from "@/components/Container";
import Icon from "@/components/Icon";
import { cn } from "@/lib/utils";

const slides: Array<{ image: string; alt: string }> = [
  { image: "/hero/carousel_01.webp", alt: "Traditional boats in a bright turquoise Philippine lagoon" },
  { image: "/hero/carousel_02.webp", alt: "A Philippine island coastline viewed from the water" },
  { image: "/hero/carousel_03.webp", alt: "A tropical beach and clear water beneath a bright sky" },
  { image: "/hero/carousel_04.webp", alt: "Friends celebrating on a tropical Philippine beach with inset scenes of a sunset skyline, an island viewpoint, snorkeling, and a boat trip" },
];

export default function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (paused || reduceMotion) return;

    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % slides.length);
    }, 6000);

    return () => window.clearInterval(timer);
  }, [paused]);

  const previous = () => setActiveIndex((index) => (index - 1 + slides.length) % slides.length);
  const next = () => setActiveIndex((index) => (index + 1) % slides.length);

  return (
    <section aria-labelledby="hero-heading" className="relative isolate overflow-hidden bg-ink-950 text-white">
      <div className="absolute inset-0 -z-10">
        {slides.map((slide, index) => (
          <Image
            key={slide.image}
            src={slide.image}
            alt={slide.alt}
            fill
            priority={index === 0}
            sizes="100vw"
            className={cn("object-cover transition-opacity duration-700", index === activeIndex ? "opacity-100" : "opacity-0")}
          />
        ))}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(14_16_19_/_0.97)_0%,rgb(14_16_19_/_0.86)_35%,rgb(14_16_19_/_0.3)_75%,rgb(14_16_19_/_0.5)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgb(14_16_19_/_0.68),transparent_55%)]" />
      </div>

      <Container className="flex min-h-[620px] items-end pb-14 pt-24 sm:min-h-[680px] sm:pb-20 lg:pb-24">
        <div className="max-w-3xl">
          <p className="font-sans text-xs font-bold uppercase tracking-[0.18em] text-green-400">Philippine travel, thoughtfully handled</p>
          <h1 id="hero-heading" className="mt-5 max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Your next journey deserves a partner who sees the whole picture.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-100 sm:text-xl">
            Creative Journeys builds tailored FIT, GIT, and MICE travel programs for people and partners who need the details handled with confidence.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/contact" className="inline-flex min-h-[var(--site-tap-min)] items-center justify-center rounded-md bg-accent-fill px-5 py-3 text-sm font-semibold !text-white transition hover:bg-green-700">
              Start a conversation <span aria-hidden="true" className="ml-2">→</span>
            </Link>
            <Link href="/services" className="inline-flex min-h-[var(--site-tap-min)] items-center justify-center rounded-md border border-white/45 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-green-400 hover:text-green-400">
              See how we work
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-3 text-xs text-white/75">
            <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 transition hover:border-green-400 hover:text-green-400" onClick={previous} aria-label="Previous hero image">
              <Icon icon={ChevronLeft} size={18} />
            </button>
            <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 transition hover:border-green-400 hover:text-green-400" onClick={next} aria-label="Next hero image">
              <Icon icon={ChevronRight} size={18} />
            </button>
            <button type="button" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/40 px-4 transition hover:border-green-400 hover:text-green-400" onClick={() => setPaused((value) => !value)} aria-label={paused ? "Play hero carousel" : "Pause hero carousel"}>
              <Icon icon={paused ? Play : Pause} size={15} />
              <span>{paused ? "Play" : "Pause"}</span>
            </button>
            <span className="ml-1 font-sans" aria-live="polite">{String(activeIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</span>
          </div>
        </div>
      </Container>
    </section>
  );
}
