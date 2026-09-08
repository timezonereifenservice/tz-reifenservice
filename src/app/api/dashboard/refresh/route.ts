import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  clearAuthCookies,
  createTokenPair,
  setAuthCookies,
} from "@/lib/dashboard-auth";
import { DASHBOARD_REFRESH_COOKIE } from "@/lib/dashboard-constants";
import { verifyRefreshToken } from "@/lib/dashboard-jwt";
import { getUserById } from "@/lib/dashboard-users/storage";

export async function POST() {
  const jar = await cookies();
  const refresh = jar.get(DASHBOARD_REFRESH_COOKIE)?.value;
  const payload = await verifyRefreshToken(refresh);

  if (!payload) {
    const response = NextResponse.json(
      { ok: false, error: "Refresh token ungültig oder abgelaufen." },
      { status: 401 },
    );
    clearAuthCookies(response);
    return response;
  }

  const user = await getUserById(payload.id);
  if (!user || !user.isActive) {
    const response = NextResponse.json(
      { ok: false, error: "Benutzer existiert nicht mehr." },
      { status: 401 },
    );
    clearAuthCookies(response);
    return response;
  }

  const tokens = await createTokenPair({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  const response = NextResponse.json({
    ok: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
  setAuthCookies(response, tokens);
  return response;
}
