import type { Metadata } from "next";
import "./globals.css";
import VisitTracker from "@/components/VisitTracker/VisitTracker";

export const metadata: Metadata = {
  title: "SCALP MAX™ — 12-Day ScalpMax Kit | Restore Your Scalp",
  description:
    "The SCALP MAX™ 12-Day ScalpMax Kit scientifically formulated to eliminate dandruff, control scalp fungus, reduce itching, and restore hair health with professional-grade alternating therapy.",
  keywords:
    "scalp treatment, dandruff treatment, scalp therapy, anti-dandruff, scalp care, SCALP MAX",
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
    ],
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: "SCALP MAX™ — 12-Day ScalpMax Kit",
    description:
      "Restore Your Scalp. Revive Your Hair. Professional-grade 12-day alternating therapy shampoo.",
    type: "website",
    locale: "en_IN",
  },
  metadataBase: new URL("https://scalpmax.in"),
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href="/logo.png" />
        <link rel="shortcut icon" type="image/png" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning>
        <div className="grain-overlay" aria-hidden="true" />
        <VisitTracker />
        {children}
      </body>
    </html>
  );
}
