import { notFound } from "next/navigation";
import DestinationEditor from "@/components/DestinationEditor";
import { updateDestination } from "@/app/admin/destinations/actions";
import { requireAdmin } from "@/lib/authz";
import { getAdminDestinationById } from "@/lib/destinations";
import {
  destinationImageUrl,
  isDestinationId,
  isStorageImagePath,
} from "@/lib/destination-model";

type EditDestinationPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditDestinationPage({
  params,
}: EditDestinationPageProps) {
  await requireAdmin();
  const { id } = await params;

  if (!isDestinationId(id)) {
    notFound();
  }

  const destination = await getAdminDestinationById(id);
  if (!destination) {
    notFound();
  }

  const initialPreviewUrl = destination.heroImage.startsWith("/") ||
    !isStorageImagePath(destination.heroImage)
    ? destination.heroImage
    : destinationImageUrl(destination.heroImage);

  return (
    <main id="main-content" className="bg-bg py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="max-w-prose">
          <p className="eyebrow">Admin</p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-text">
            Edit {destination.name}
          </h1>
          <p className="mt-4 text-base text-muted">
            Changes are published to the public destination pages after saving.
          </p>
        </header>
        <div className="mt-12">
          <DestinationEditor
            action={updateDestination.bind(null, destination.id)}
            initialDestination={destination}
            initialPreviewUrl={initialPreviewUrl}
            submitLabel="Save destination"
          />
        </div>
      </div>
    </main>
  );
}
