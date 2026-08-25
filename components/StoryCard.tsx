import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Card from "@/components/Card";
import Icon from "@/components/Icon";
import type { Story } from "@/lib/story-model";
import { storyExcerpt, storyImageUrl } from "@/lib/story-model";

const formatStoryDate = new Intl.DateTimeFormat("en-PH", {
  dateStyle: "long",
  timeZone: "UTC",
});

export default function StoryCard({ story }: { story: Story }) {
  return (
    <Card className="group overflow-hidden transition duration-200 hover:-translate-y-1 hover:shadow-site-strong">
      <Link
        aria-label={`Read ${story.title}`}
        className="block"
        href={`/stories/${story.slug}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={storyImageUrl(story.coverImagePath)}
            alt={story.coverImageAlt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
      </Link>
      <div className="p-5 sm:p-6">
        <p className="font-sans text-xs font-semibold uppercase tracking-[0.12em] text-accent">
          {formatStoryDate.format(new Date(story.storyDate + "T00:00:00Z"))}
        </p>
        <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-text">
          <Link className="transition hover:text-accent" href={`/stories/${story.slug}`}>
            {story.title}
          </Link>
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {storyExcerpt(story.body)}
        </p>
        <Link
          href={`/stories/${story.slug}`}
          className="mt-5 inline-flex min-h-[var(--site-tap-min)] items-center gap-2 text-sm font-semibold text-link underline decoration-transparent transition hover:text-accent hover:decoration-current"
        >
          Read the story <Icon icon={ArrowUpRight} size={17} />
        </Link>
      </div>
    </Card>
  );
}
