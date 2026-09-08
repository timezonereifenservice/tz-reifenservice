import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const siteMetadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description:
    "Dashboard für Website-Analytics und Leads — Time Zone Reifenservice Pulheim.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.png"],
  },
};
