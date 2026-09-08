import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getDashboardUser } from "@/lib/dashboard-auth";
import { DASHBOARD_PATH } from "@/lib/dashboard-constants";

export default async function DashboardAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getDashboardUser();

  if (!user) {
    redirect(DASHBOARD_PATH);
  }

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
