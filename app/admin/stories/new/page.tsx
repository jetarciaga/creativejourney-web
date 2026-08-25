import StoryEditor from "@/components/StoryEditor";
import { createStory } from "@/app/admin/stories/actions";
import { requireAdmin } from "@/lib/authz";

export default async function NewStoryPage() {
  await requireAdmin();

  return (
    <main id="main-content" className="bg-bg py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="max-w-prose">
          <p className="eyebrow">Admin</p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-text">
            New story
          </h1>
          <p className="mt-4 text-base text-muted">
            Add a client story with a photo, date, and a few paragraphs.
          </p>
        </header>
        <div className="mt-12">
          <StoryEditor action={createStory} initialStory={null} submitLabel="Create story" />
        </div>
      </div>
    </main>
  );
}
