import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DASHBOARD_COOKIE } from "@/lib/dashboard-constants";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(DASHBOARD_COOKIE);
  return NextResponse.json({ ok: true });
}
