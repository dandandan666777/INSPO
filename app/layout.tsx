import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_NAME = "Design Inspiration";
const SITE_DESCRIPTION =
  "Search the product-design web with natural language. Semantic search across editorial coverage from Dezeen, Yanko Design, Core77, Cool Hunting, Gessato and more — filter by material, finish, form, not tags.";

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — semantic search for product design`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "Daniel Hancox" }],
  keywords: [
    "product design",
    "industrial design",
    "design inspiration",
    "semantic search",
    "CLIP",
    "designer tools",
  ],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — semantic search for product design`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — semantic search for product design`,
    description: SITE_DESCRIPTION,
  },
  themeColor: "#f8f6f2",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="flex-1">{children}</div>
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
