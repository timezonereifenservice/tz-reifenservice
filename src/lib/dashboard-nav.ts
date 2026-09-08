import {
  BarChart3,
  LayoutDashboard,
  LogOut,
  UserCircle,
  type LucideIcon,
} from "lucide-react";

export type DashboardNavItem = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
};

export const dashboardNavItems: DashboardNavItem[] = [
  {
    id: "overview",
    label: "Übersicht",
    href: "/dashboard/overview",
    icon: LayoutDashboard,
  },
  {
    id: "website-analytics",
    label: "Website-Analytics",
    href: "/dashboard/website-analytics",
    icon: BarChart3,
  },
  {
    id: "leads",
    label: "Leads",
    href: "/dashboard/leads",
    icon: UserCircle,
  },
];

export const dashboardLogoutItem = {
  id: "logout",
  label: "Abmelden",
  icon: LogOut,
} as const;

export function getDashboardPageTitle(pathname: string) {
  const match = dashboardNavItems.find(
    (item) =>
      pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  return match?.label ?? "Dashboard";
}

export function getUserDisplayName(email: string) {
  const localPart = email.split("@")[0] ?? "User";
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
