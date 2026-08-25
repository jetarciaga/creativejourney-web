import { notFound } from "next/navigation";
import StoryEditor from "@/components/StoryEditor";
import { updateStory } from "@/app/admin/stories/actions";
import { requireAdmin } from "@/lib/authz";
import { getAdminStoryById } from "@/lib/stories";
import { isStoryId, storyImageUrl } from "@/lib/story-model";

type EditStoryPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditStoryPage({ params }: EditStoryPageProps) {
  await requireAdmin();
  const { id } = await params;

  if (!isStoryId(id)) {
    notFound();
  }

  const story = await getAdminStoryById(id);
  if (!story) {
    notFound();
  }

  return (
    <main id="main-content" className="bg-bg py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="max-w-prose">
          <p className="eyebrow">Admin</p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-text">
            Edit {story.title}
          </h1>
          <p className="mt-4 text-base text-muted">
            Save as a draft while the story is still being written, or publish it when ready.
          </p>
        </header>
        <div className="mt-12">
          <StoryEditor
            action={updateStory.bind(null, story.id)}
            initialImageUrl={storyImageUrl(story.coverImagePath)}
            initialStory={story}
            submitLabel="Save story"
          />
        </div>
      </div>
    </main>
  );
}
