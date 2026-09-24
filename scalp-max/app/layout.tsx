import type { Metadata } from "next";
import "./globals.css";
import VisitTracker from "@/components/VisitTracker/VisitTracker";

export const metadata: Metadata = {
  title: "SCALP MAX™ | India’s First Scalp-Focused Hair Care Brand",
  description:
    "SCALP MAX™ is India’s first scalp-focused hair care brand. We focus on the scalp first to support healthier-looking hair. Scalp First. Hair Follows.",
  keywords:
    "SCALP MAX, India’s first scalp-focused hair care brand, scalp focused hair care, scalp care, scalp treatment, dandruff treatment, scalp therapy, anti-dandruff, healthy scalp, hair care India",
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: "/favicon.png",
  },
  openGraph: {
    title: "SCALP MAX™ | India’s First Scalp-Focused Hair Care Brand",
    description:
      "SCALP MAX™ is India’s first scalp-focused hair care brand. We focus on the scalp first to support healthier-looking hair. Scalp First. Hair Follows.™",
    type: "website",
    locale: "en_IN",
    url: "https://scalpmax.in",
  },
  metadataBase: new URL("https://scalpmax.in"),
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body suppressHydrationWarning>
        <div className="grain-overlay" aria-hidden="true" />
        <VisitTracker />
        {children}
      </body>
    </html>
  );
}
