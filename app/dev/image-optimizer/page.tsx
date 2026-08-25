import { notFound } from "next/navigation";
import ImageOptimizerTestHarness from "@/components/ImageOptimizerTestHarness";

export default function ImageOptimizerDevPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <ImageOptimizerTestHarness />;
}
