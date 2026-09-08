import type { DashboardUserRole } from "@/lib/dashboard-users/types";

export type DashboardNavId =
  | "overview"
  | "website-analytics"
  | "leads"
  | "users";

const NAV_BY_ROLE: Record<DashboardUserRole, readonly DashboardNavId[]> = {
  Admin: ["overview", "website-analytics", "leads", "users"],
  Viewer: ["overview", "website-analytics", "leads"],
};

export function navIdsForRole(role: DashboardUserRole | string | undefined) {
  if (role === "Admin" || role === "Viewer") {
    return NAV_BY_ROLE[role];
  }
  return NAV_BY_ROLE.Viewer;
}

export function canAccessNav(
  role: DashboardUserRole | string | undefined,
  navId: DashboardNavId,
) {
  return navIdsForRole(role).includes(navId);
}

export function navIdForPath(pathname: string): DashboardNavId | null {
  if (pathname.startsWith("/dashboard/users")) return "users";
  if (pathname.startsWith("/dashboard/leads")) return "leads";
  if (pathname.startsWith("/dashboard/website-analytics")) {
    return "website-analytics";
  }
  if (pathname.startsWith("/dashboard/overview")) return "overview";
  return null;
}

export function canManageUsers(role: DashboardUserRole | string | undefined) {
  return role === "Admin";
}
