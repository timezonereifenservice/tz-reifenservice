export const DASHBOARD_USER_ROLES = ["Admin", "Viewer"] as const;

export type DashboardUserRole = (typeof DASHBOARD_USER_ROLES)[number];

export type DashboardUser = {
  id: string;
  name: string;
  email: string;
  role: DashboardUserRole;
  isActive: boolean;
  createdAt: string;
};

export type CreateDashboardUserInput = {
  name: string;
  email: string;
  password: string;
  role: DashboardUserRole;
};
