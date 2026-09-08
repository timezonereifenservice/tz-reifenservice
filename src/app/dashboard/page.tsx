import { redirect } from "next/navigation";
import { DashboardLogin } from "@/components/dashboard/dashboard-login";
import { isDashboardAuthenticated } from "@/lib/dashboard-auth";
import { DASHBOARD_PATH } from "@/lib/dashboard-constants";

export default async function DashboardLoginPage() {
  const authenticated = await isDashboardAuthenticated();

  if (authenticated) {
    redirect(`${DASHBOARD_PATH}/overview`);
  }

  return <DashboardLogin />;
}
