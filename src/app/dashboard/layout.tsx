import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "../globals.css";
import { siteConfig } from "@/config/site";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  title: `Dashboard | ${siteConfig.name}`,
  robots: { index: false, follow: false, noarchive: true },
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de" className={inter.variable}>
      <body className="min-h-dvh font-sans antialiased">{children}</body>
    </html>
  );
}
