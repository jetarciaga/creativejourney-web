import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import SkipLink from "@/components/SkipLink";
import ThemeProvider from "@/components/ThemeProvider";
import { SITE, SITE_URL } from "@/lib/site";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: {
    default: SITE.name,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${playfairDisplay.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider>
          <SkipLink />
          <Header />
          <main id="content">{children}</main>
          <Footer />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
