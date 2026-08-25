import type { Metadata } from "next";
import StoryCard from "@/components/StoryCard";
import PageHeader from "@/components/PageHeader";
import Section from "@/components/Section";
import { listStories } from "@/lib/stories";
import { metadataForRoute } from "@/lib/seo";

export const revalidate = 300;

export function generateMetadata(): Metadata {
  return metadataForRoute("/stories");
}

export default async function StoriesPage() {
  const stories = await listStories();

  return (
    <>
      <PageHeader
        eyebrow="Client success stories"
        title="A look at programs we have delivered with our partners."
        description="Read how Creative Journeys has worked with travel agents and corporate buyers on practical Philippine FIT, GIT, and MICE programs."
      />
      <Section
        title="Stories from the work"
        description="Each account starts with a brief and ends with a program the people travelling can rely on."
      >
        {stories.length === 0 ? (
          <p className="border-t border-border pt-6 text-muted">
            We are preparing the first stories. Check back soon for examples of programs we have delivered with our partners.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
