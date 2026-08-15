import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServiceDetailPage from "@/components/ServiceDetailPage";
import { services } from "@/lib/content";
import { metadataForRoute } from "@/lib/seo";

export function generateMetadata(): Metadata {
  return metadataForRoute("/services/mice");
}

export default function Page() {
  const service = services.find((item) => item.id === "mice");
  if (!service) notFound();
  return <ServiceDetailPage service={service} />;
}
