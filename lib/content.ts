export const services = [
  {
    id: "fit",
    acronym: "FIT",
    title: "Free Independent Travel",
    description:
      "Thoughtful itineraries for travellers who want the freedom to explore with the right logistics already handled.",
    bullets: ["Tailored day-by-day planning", "Hotels, transfers, and activities", "Flexible for couples and families"],
    href: "/services/fit",
  },
  {
    id: "git",
    acronym: "GIT",
    title: "Group Incentive Travel",
    description:
      "Coordinated group programs that keep the experience smooth for guests and straightforward for the organiser.",
    bullets: ["Group rates and rooming support", "Coordinated ground handling", "On-trip care for every movement"],
    href: "/services/git",
  },
  {
    id: "mice",
    acronym: "MICE",
    title: "Meetings, Incentives, Conferences & Events",
    description:
      "Corporate travel programs designed around your objective, audience, schedule, and standards of service.",
    bullets: ["Venue and event coordination", "Delegate logistics and transfers", "Clear, accountable program delivery"],
    href: "/services/mice",
  },
] as const;

export type Service = (typeof services)[number];
export type ServiceId = Service["id"];
