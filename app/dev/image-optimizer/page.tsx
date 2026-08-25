import { notFound } from "next/navigation";
import StoryImageTestHarness from "@/components/StoryImageTestHarness";

export default function ImageOptimizerDevPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <StoryImageTestHarness />;
}
