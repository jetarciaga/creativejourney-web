import Link from "next/link";
import { deleteStory } from "@/app/admin/stories/actions";
import { requireAdmin } from "@/lib/authz";
import { listAdminStories } from "@/lib/stories";

const formatStoryDate = new Intl.DateTimeFormat("en-PH", {
  dateStyle: "long",
  timeZone: "UTC",
});

export default async function AdminStoriesPage() {
  await requireAdmin();
  const stories = await listAdminStories();

  return (
    <main id="main-content" className="bg-bg py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-prose">
            <h1 className="font-display text-4xl font-semibold tracking-tight text-text">
              Stories
            </h1>
            <p className="mt-4 text-base text-muted">
              Draft and publish client success stories for the public site.
            </p>
          </div>
          <Link
            className="inline-flex min-h-[var(--site-tap-min)] items-center rounded-md bg-accent-fill px-5 py-3 text-sm font-semibold !text-white transition hover:bg-green-700"
            href="/admin/stories/new"
          >
            New story
          </Link>
        </header>

        <div className="mt-12 space-y-6">
          {stories.length === 0 ? (
            <p className="border-t border-border pt-6 text-muted">
              No stories have been added yet.
            </p>
          ) : (
            stories.map((story) => (
              <article className="border-t border-border pt-6" key={story.id}>
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-2xl">
                    <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                      <span className={story.published ? "text-accent" : "text-muted"}>
                        {story.published ? "Published" : "Draft"}
                      </span>
                      <span>{formatStoryDate.format(new Date(story.storyDate + "T00:00:00Z"))}</span>
                    </div>
                    <h2 className="mt-3 font-display text-2xl font-semibold text-text">
                      <Link
                        className="transition hover:text-accent"
                        href={`/admin/stories/${story.id}/edit`}
                      >
                        {story.title}
                      </Link>
                    </h2>
                    <p className="mt-2 text-sm text-muted">/{story.slug}</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {story.published ? (
                      <Link
                        className="inline-flex min-h-[var(--site-tap-min)] items-center rounded-md border border-border px-4 py-2 text-sm font-semibold text-text transition hover:border-accent hover:text-accent"
                        href={`/stories/${story.slug}`}
                      >
                        View
                      </Link>
                    ) : null}
                    <Link
                      className="inline-flex min-h-[var(--site-tap-min)] items-center rounded-md border border-border px-4 py-2 text-sm font-semibold text-text transition hover:border-accent hover:text-accent"
                      href={`/admin/stories/${story.id}/edit`}
                    >
                      Edit
                    </Link>
                    <form action={deleteStory.bind(null, story.id)}>
                      <button
                        className="min-h-[var(--site-tap-min)] rounded-md border border-border px-4 py-2 text-sm font-semibold text-muted transition hover:border-accent hover:text-accent"
                        type="submit"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
