import type { DashboardUserRole } from "@/lib/dashboard-users/types";
import { DASHBOARD_USER_ROLES } from "@/lib/dashboard-users/types";

export type UserRow = {
  id: string;
  email: string;
  full_name: string;
  password_hash: string;
  role: DashboardUserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export function isDashboardUserRole(value: string): value is DashboardUserRole {
  return (DASHBOARD_USER_ROLES as readonly string[]).includes(value);
}

export function mapUserRowToDashboardUser(
  row: Omit<UserRow, "password_hash"> & { is_active?: boolean },
) {
  return {
    id: row.id,
    name: row.full_name,
    email: row.email,
    role: row.role,
    isActive: row.is_active !== false,
    createdAt: row.created_at,
  };
}
