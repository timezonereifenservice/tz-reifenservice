import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import "../globals.css";
import { siteConfig } from "@/config/site";
import { siteMetadata } from "@/lib/site-metadata";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  ...siteMetadata,
  title: `Dashboard | ${siteConfig.name}`,
  robots: { index: false, follow: false, noarchive: true },
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.png" type="image/png" sizes="512x512" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-dvh font-sans antialiased">{children}</body>
    </html>
  );
}
