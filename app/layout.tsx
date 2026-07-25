import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { FeedbackSection } from "@/components/feedback-section";
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

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const SITE_NAME = "Product Inspo";
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
      className={`${geistSans.variable} ${geistMono.variable} ${jetbrainsMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="flex-1">{children}</div>
        <FeedbackSection />
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
