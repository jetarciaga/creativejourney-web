import { createElement, type AnchorHTMLAttributes, type ImgHTMLAttributes } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const themeState = vi.hoisted(() => ({
  resolvedTheme: "dark",
  theme: "dark",
  setTheme: vi.fn(),
}));

vi.mock("next-themes", () => ({
  useTheme: () => themeState,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("next/link", () => ({
  default: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => <a {...props} />,
}));

vi.mock("next/image", () => ({
  default: (props: ImgHTMLAttributes<HTMLImageElement>) => createElement("img", props),
}));

import Header from "@/components/Header";

describe("Header logo hydration", () => {
  it("uses the fixed light logo during the server snapshot even when dark theme is active", () => {
    const markup = renderToString(<Header />);

    expect(markup).toContain('src="/brand/logo-wordmark-light.png"');
    expect(markup).not.toContain("/brand/logo-wordmark-dark.png");
  });
});
