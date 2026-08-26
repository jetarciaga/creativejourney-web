import { readFile } from "node:fs/promises";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

type OptimizerResult = {
  blob: Blob;
  contentType: string;
  width: number;
  height: number;
};

type BrowserOptimizer = {
  prepareImageForUpload(file: File): Promise<OptimizerResult>;
  maxEdge: number;
};

async function openOptimizerPage(page: Page) {
  await page.goto("/dev/image-optimizer");
  await page.waitForFunction(() =>
    Boolean(
      (window as unknown as { __imageOptimizer?: BrowserOptimizer })
        .__imageOptimizer,
    ),
  );
}

test.describe("image optimizer", () => {
  test("downscales and re-encodes a large landscape image", async ({ page }) => {
    await openOptimizerPage(page);

    const result = await page.evaluate(async () => {
      const optimizer = (window as unknown as { __imageOptimizer?: BrowserOptimizer })
        .__imageOptimizer;
      if (!optimizer) throw new Error("The image optimizer bridge is missing.");
      const inputCanvas = document.createElement("canvas");
      inputCanvas.width = 4032;
      inputCanvas.height = 3024;
      const context = inputCanvas.getContext("2d");
      if (!context) throw new Error("Canvas is unavailable.");

      const gradient = context.createLinearGradient(0, 0, inputCanvas.width, inputCanvas.height);
      gradient.addColorStop(0, "#0b6b57");
      gradient.addColorStop(0.5, "#e3b04b");
      gradient.addColorStop(1, "#12202b");
      context.fillStyle = gradient;
      context.fillRect(0, 0, inputCanvas.width, inputCanvas.height);
      context.fillStyle = "rgba(255,255,255,0.35)";
      for (let index = 0; index < 24; index += 1) {
        context.beginPath();
        context.arc(120 + index * 160, 160 + (index % 6) * 460, 90, 0, Math.PI * 2);
        context.fill();
      }

      const inputBlob = await new Promise<Blob>((resolve, reject) => {
        inputCanvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Fixture failed."))), "image/jpeg", 0.95);
      });
      const input = new File([inputBlob], "large-fixture.jpg", { type: "image/jpeg" });
      const output = await optimizer.prepareImageForUpload(input);
      const bitmap = await createImageBitmap(output.blob);

      return {
        contentType: output.contentType,
        width: output.width,
        height: output.height,
        bitmapWidth: bitmap.width,
        bitmapHeight: bitmap.height,
        inputSize: input.size,
        outputSize: output.blob.size,
        maxEdge: optimizer.maxEdge,
      };
    });

    expect(result.contentType).toBe("image/webp");
    expect(result.width).toBe(result.maxEdge);
    expect(result.height).toBe(1800);
    expect(result.bitmapWidth).toBe(result.maxEdge);
    expect(result.bitmapHeight).toBe(1800);
    expect(result.outputSize).toBeLessThan(result.inputSize * 0.8);
  });

  test("leaves an already-small image byte-identical", async ({ page }) => {
    await openOptimizerPage(page);

    const result = await page.evaluate(async () => {
      const optimizer = (window as unknown as { __imageOptimizer?: BrowserOptimizer })
        .__imageOptimizer;
      if (!optimizer) throw new Error("The image optimizer bridge is missing.");
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 900;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas is unavailable.");
      context.fillStyle = "#0b6b57";
      context.fillRect(0, 0, canvas.width, canvas.height);

      const inputBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Fixture failed."))), "image/png");
      });
      const inputBytes = Array.from(new Uint8Array(await inputBlob.arrayBuffer()));
      const input = new File([inputBlob], "small-fixture.png", { type: "image/png" });
      const output = await optimizer.prepareImageForUpload(input);
      const outputBytes = Array.from(new Uint8Array(await output.blob.arrayBuffer()));

      return {
        contentType: output.contentType,
        width: output.width,
        height: output.height,
        inputBytes,
        outputBytes,
      };
    });

    expect(result.contentType).toBe("image/png");
    expect(result.width).toBe(1200);
    expect(result.height).toBe(900);
    expect(result.outputBytes).toEqual(result.inputBytes);
  });

  test("honours EXIF orientation 6", async ({ page }) => {
    await openOptimizerPage(page);
    const fixture = await readFile(
      path.join(process.cwd(), "e2e/fixtures/orientation-6.jpg"),
    );

    const result = await page.evaluate(async (fixtureBytes) => {
      const optimizer = (window as unknown as { __imageOptimizer?: BrowserOptimizer })
        .__imageOptimizer;
      if (!optimizer) throw new Error("The image optimizer bridge is missing.");
      const input = new File([new Uint8Array(fixtureBytes)], "orientation-6.jpg", {
        type: "image/jpeg",
      });
      const output = await optimizer.prepareImageForUpload(input);
      return {
        contentType: output.contentType,
        width: output.width,
        height: output.height,
      };
    }, Array.from(fixture));

    expect(result.contentType).toBe("image/jpeg");
    expect(result.width).toBeLessThan(result.height);
    expect(result.width).toBe(60);
    expect(result.height).toBe(100);
  });

  test("re-encodes a large EXIF-oriented portrait", async ({ page }) => {
    await openOptimizerPage(page);
    const fixture = await readFile(
      path.join(process.cwd(), "e2e/fixtures/orientation-6-large.jpg"),
    );

    const result = await page.evaluate(async (fixtureBytes) => {
      const optimizer = (window as unknown as { __imageOptimizer?: BrowserOptimizer })
        .__imageOptimizer;
      if (!optimizer) throw new Error("The image optimizer bridge is missing.");
      const input = new File(
        [new Uint8Array(fixtureBytes)],
        "orientation-6-large.jpg",
        { type: "image/jpeg" },
      );
      const output = await optimizer.prepareImageForUpload(input);
      return {
        contentType: output.contentType,
        width: output.width,
        height: output.height,
        maxEdge: optimizer.maxEdge,
      };
    }, Array.from(fixture));

    expect(result.contentType).toBe("image/webp");
    expect(result.width).toBeLessThan(result.height);
    expect(Math.max(result.width, result.height)).toBe(result.maxEdge);
  });

  test("never upscales a small image", async ({ page }) => {
    await openOptimizerPage(page);

    const result = await page.evaluate(async () => {
      const optimizer = (window as unknown as { __imageOptimizer?: BrowserOptimizer })
        .__imageOptimizer;
      if (!optimizer) throw new Error("The image optimizer bridge is missing.");
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 300;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas is unavailable.");
      context.fillStyle = "#e3b04b";
      context.fillRect(0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((value) => (value ? resolve(value) : reject(new Error("Fixture failed."))), "image/jpeg");
      });
      const output = await optimizer.prepareImageForUpload(
        new File([blob], "small.jpg", { type: "image/jpeg" }),
      );
      return { width: output.width, height: output.height };
    });

    expect(result).toEqual({ width: 400, height: 300 });
  });
});
