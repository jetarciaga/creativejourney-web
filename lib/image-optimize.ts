export const STORY_IMAGE_MAX_EDGE = 2400;
export const STORY_IMAGE_WEBP_QUALITY = 0.82;

const STORY_IMAGE_MAX_PASSTHROUGH_BYTES = 600 * 1024;

export function targetDimensions(
  width: number,
  height: number,
  maxEdge: number,
): { width: number; height: number } {
  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    !Number.isFinite(maxEdge) ||
    width <= 0 ||
    height <= 0 ||
    maxEdge <= 0
  ) {
    throw new Error("Image dimensions and maxEdge must be positive numbers.");
  }

  const longEdge = Math.max(width, height);
  if (longEdge <= maxEdge) {
    return { width, height };
  }

  const scale = maxEdge / longEdge;
  const scaledWidth = Math.max(1, Math.round(width * scale));
  const scaledHeight = Math.max(1, Math.round(height * scale));

  if (width >= height) {
    return { width: Math.min(maxEdge, scaledWidth), height: scaledHeight };
  }

  return { width: scaledWidth, height: Math.min(maxEdge, scaledHeight) };
}

export function shouldReencode(
  byteSize: number,
  width: number,
  height: number,
): boolean {
  return byteSize > STORY_IMAGE_MAX_PASSTHROUGH_BYTES ||
    Math.max(width, height) > STORY_IMAGE_MAX_EDGE;
}

function canvasToWebp(
  canvas: OffscreenCanvas | HTMLCanvasElement,
): Promise<Blob | null> {
  if (typeof OffscreenCanvas !== "undefined" && canvas instanceof OffscreenCanvas) {
    return canvas.convertToBlob({
      type: "image/webp",
      quality: STORY_IMAGE_WEBP_QUALITY,
    });
  }

  return new Promise((resolve) => {
    (canvas as HTMLCanvasElement).toBlob(
      resolve,
      "image/webp",
      STORY_IMAGE_WEBP_QUALITY,
    );
  });
}

export async function prepareStoryImage(file: File): Promise<{
  blob: Blob;
  contentType: string;
  width: number;
  height: number;
}> {
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  });
  const { width, height } = bitmap;

  if (!shouldReencode(file.size, width, height)) {
    bitmap.close();
    return {
      blob: file,
      contentType: file.type,
      width,
      height,
    };
  }

  const dimensions = targetDimensions(width, height, STORY_IMAGE_MAX_EDGE);
  const canvas: OffscreenCanvas | HTMLCanvasElement =
    typeof OffscreenCanvas !== "undefined"
      ? new OffscreenCanvas(dimensions.width, dimensions.height)
      : Object.assign(document.createElement("canvas"), {
          width: dimensions.width,
          height: dimensions.height,
        });
  const context = canvas.getContext("2d");

  if (!context) {
    bitmap.close();
    return {
      blob: file,
      contentType: file.type,
      width,
      height,
    };
  }

  context.drawImage(bitmap, 0, 0, dimensions.width, dimensions.height);
  const optimizedBlob = await canvasToWebp(canvas);
  bitmap.close();

  if (!optimizedBlob || optimizedBlob.size > file.size) {
    return {
      blob: file,
      contentType: file.type,
      width,
      height,
    };
  }

  return {
    blob: optimizedBlob,
    contentType: optimizedBlob.type || "image/webp",
    width: dimensions.width,
    height: dimensions.height,
  };
}
