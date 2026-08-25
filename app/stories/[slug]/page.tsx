import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import Button from "@/components/Button";
import Container from "@/components/Container";
import PageHeader from "@/components/PageHeader";
import Section from "@/components/Section";
import { getStoryBySlug, listStories } from "@/lib/stories";
import { storyExcerpt, storyImageUrl } from "@/lib/story-model";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 300;

const formatStoryDate = new Intl.DateTimeFormat("en-PH", {
  dateStyle: "long",
  timeZone: "UTC",
});

const getCachedStory = cache((slug: string) => getStoryBySlug(slug));

export async function generateStaticParams() {
  const stories = await listStories();
  return stories.map((story) => ({ slug: story.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const story = await getCachedStory(slug);

  if (!story) {
    return { title: "Story not found" };
  }

  const description = storyExcerpt(story.body, 160);
  const title = story.title + " — Creative Journeys Travel PH";
  const url = absoluteUrl("/stories/" + story.slug);
  const imageUrl = storyImageUrl(story.coverImagePath);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      images: [{ url: imageUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function StoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = await getCachedStory(slug);

  if (!story) {
    notFound();
  }

  const paragraphs = story.body.trim().split(/\n\s*\n/).filter(Boolean);

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Stories", href: "/stories" },
          { label: story.title },
        ]}
      />
      <PageHeader
        eyebrow="Client success story"
        title={story.title}
        description={formatStoryDate.format(new Date(story.storyDate + "T00:00:00Z"))}
      />

      <section className="py-12 sm:py-16">
        <Container>
          <div className="relative aspect-[16/8] overflow-hidden rounded-card border border-border bg-surface shadow-site">
            <Image
              src={storyImageUrl(story.coverImagePath)}
              alt={story.coverImageAlt}
              fill
              priority
              sizes="(min-width: 1024px) 1200px, 100vw"
              className="object-cover"
            />
          </div>
        </Container>
      </section>

      <Section title="The story">
        <div className="max-w-3xl space-y-5 text-base leading-relaxed text-text">
          {paragraphs.map((paragraph, index) => (
            <p key={`${story.id}-paragraph-${index}`}>{paragraph}</p>
          ))}
        </div>
      </Section>

      <section className="border-t border-border py-12 sm:py-16">
        <Container className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">Planning a similar program?</p>
          <div className="flex flex-wrap gap-3">
            <Button href="/contact">Talk to our team</Button>
            <Link
              className="inline-flex min-h-[var(--site-tap-min)] items-center rounded-md border border-border px-5 py-3 text-sm font-semibold text-text transition hover:border-accent hover:text-accent"
              href="/stories"
            >
              All stories
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
