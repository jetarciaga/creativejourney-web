import type { StaticImageData } from "next/image";
import boracayImage from "@/src/assets/images/boracayBeach.webp";
import boholImage from "@/src/assets/images/hinagdanan-cave.webp";
import cebuImage from "@/src/assets/images/cebuWhaleShark.webp";

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

export const destinations: Array<{
  slug: string;
  name: string;
  region: string;
  summary: string;
  image: StaticImageData;
  alt: string;
}> = [
  {
    slug: "cebu",
    name: "Cebu",
    region: "Central Visayas",
    summary: "Island energy, heritage, and ocean adventures in one flexible program.",
    image: cebuImage,
    alt: "A whale shark swimming beneath a snorkeller in clear blue water",
  },
  {
    slug: "bohol",
    name: "Bohol",
    region: "Central Visayas",
    summary: "Caves, coastlines, countryside, and easy-going group experiences.",
    image: boholImage,
    alt: "Visitors exploring the clear underground pool inside Hinagdanan Cave",
  },
  {
    slug: "boracay",
    name: "Boracay",
    region: "Western Visayas",
    summary: "A polished island escape built around beaches, water, and downtime.",
    image: boracayImage,
    alt: "Aerial view of palm trees and a bright white beach beside turquoise water",
  },
];
