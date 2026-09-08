import { cookies } from "next/headers";
import { DASHBOARD_COOKIE } from "@/lib/dashboard-constants";

export type DashboardUser = {
  email: string;
  name: string;
};

function decodeSession(value: string): DashboardUser | null {
  try {
    const json = Buffer.from(value, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as DashboardUser;
    if (!parsed.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function encodeSession(user: DashboardUser) {
  return Buffer.from(JSON.stringify(user), "utf8").toString("base64url");
}

export async function getDashboardUser(): Promise<DashboardUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(DASHBOARD_COOKIE)?.value;
  if (!token) return null;
  return decodeSession(token);
}

export async function isDashboardAuthenticated() {
  return Boolean(await getDashboardUser());
}
