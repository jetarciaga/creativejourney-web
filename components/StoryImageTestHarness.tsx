"use client";

import { useEffect } from "react";
import {
  prepareStoryImage,
  STORY_IMAGE_MAX_EDGE,
} from "@/lib/image-optimize";

declare global {
  interface Window {
    __storyImageOptimizer?: {
      prepareStoryImage: typeof prepareStoryImage;
      maxEdge: number;
    };
  }
}

export default function StoryImageTestHarness() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    window.__storyImageOptimizer = {
      prepareStoryImage,
      maxEdge: STORY_IMAGE_MAX_EDGE,
    };

    return () => {
      delete window.__storyImageOptimizer;
    };
  }, []);

  return null;
}
