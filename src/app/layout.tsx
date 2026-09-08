import type { ReactNode } from "react";
import type { Metadata } from "next";
import { siteMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = siteMetadata;

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
