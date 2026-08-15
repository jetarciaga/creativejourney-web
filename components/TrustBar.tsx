import { TRUSTED_CLIENT_GROUPS, yearsInBusiness } from "@/lib/site";

export default function TrustBar() {
  const secondValue = TRUSTED_CLIENT_GROUPS
    ? `${TRUSTED_CLIENT_GROUPS}+`
    : "FIT · GIT · MICE";
  const secondLabel = TRUSTED_CLIENT_GROUPS
    ? "client and group programs delivered"
    : "programs built around your brief";

  return (
    <section aria-label="Creative Journeys at a glance" className="border-y border-border bg-surface">
      <div className="mx-auto grid max-w-7xl divide-y divide-border px-4 sm:grid-cols-2 sm:divide-x sm:divide-y-0 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 py-6 sm:pr-8">
          <p className="metric-value font-display text-3xl font-semibold tracking-tight text-metric">{yearsInBusiness()}+</p>
          <p className="max-w-[15rem] text-sm text-muted">years building travel programs from the Philippines</p>
        </div>
        <div className="flex items-center gap-4 py-6 sm:pl-8">
          <p className="font-display text-2xl font-semibold tracking-tight text-text">{secondValue}</p>
          <p className="max-w-[15rem] text-sm text-muted">{secondLabel}</p>
        </div>
      </div>
    </section>
  );
}
