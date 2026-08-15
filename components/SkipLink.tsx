export default function SkipLink() {
  return (
    <a
      className="sr-only fixed left-4 top-4 z-[100] rounded-md bg-accent-fill px-4 py-3 text-sm font-semibold !text-white shadow-site focus:not-sr-only focus-visible:translate-y-0"
      href="#content"
    >
      Skip to content
    </a>
  );
}
