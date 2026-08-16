import Link from "next/link";

export function AdminNav() {
  return (
    <nav aria-label="Admin sections" className="mt-4 flex gap-5 text-sm">
      <Link
        className="border-b-2 border-accent pb-2 font-semibold text-text"
        href="/admin"
      >
        Destinations
      </Link>
    </nav>
  );
}
