"use client";

import { useEffect } from "react";
import {
  IMAGE_MAX_EDGE,
  prepareImageForUpload,
} from "@/lib/image-optimize";

declare global {
  interface Window {
    __imageOptimizer?: {
      prepareImageForUpload: typeof prepareImageForUpload;
      maxEdge: number;
    };
  }
}

export default function ImageOptimizerTestHarness() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    window.__imageOptimizer = {
      prepareImageForUpload,
      maxEdge: IMAGE_MAX_EDGE,
    };

    return () => {
      delete window.__imageOptimizer;
    };
  }, []);

  return null;
}
