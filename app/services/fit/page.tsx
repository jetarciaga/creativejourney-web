import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServiceDetailPage from "@/components/ServiceDetailPage";
import { services } from "@/lib/content";
import { metadataForRoute } from "@/lib/seo";

export function generateMetadata(): Metadata {
  return metadataForRoute("/services/fit");
}

export default function Page() {
  const service = services.find((item) => item.id === "fit");
  if (!service) notFound();
  return <ServiceDetailPage service={service} />;
}
