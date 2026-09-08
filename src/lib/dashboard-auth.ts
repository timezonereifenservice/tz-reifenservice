import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_MAX_AGE_SECONDS,
  DASHBOARD_ACCESS_COOKIE,
  DASHBOARD_REFRESH_COOKIE,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
} from "@/lib/dashboard-constants";
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  type TokenPayload,
} from "@/lib/dashboard-jwt";
import type { DashboardUserRole } from "@/lib/dashboard-users/types";

function cookieBase() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

export async function createTokenPair(user: TokenPayload) {
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken(user),
    signRefreshToken(user),
  ]);
  return { accessToken, refreshToken };
}

export function setAuthCookies(
  response: NextResponse,
  tokens: { accessToken: string; refreshToken: string },
) {
  const base = cookieBase();
  response.cookies.set({
    ...base,
    name: DASHBOARD_ACCESS_COOKIE,
    value: tokens.accessToken,
    maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
  });
  response.cookies.set({
    ...base,
    name: DASHBOARD_REFRESH_COOKIE,
    value: tokens.refreshToken,
    maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
  });
}

export function clearAuthCookies(response: NextResponse) {
  const base = cookieBase();
  for (const name of [DASHBOARD_ACCESS_COOKIE, DASHBOARD_REFRESH_COOKIE]) {
    response.cookies.set({ ...base, name, value: "", maxAge: 0 });
  }
}

export async function getDashboardUser() {
  const jar = await cookies();
  const access = jar.get(DASHBOARD_ACCESS_COOKIE)?.value;
  const fromAccess = await verifyAccessToken(access);
  if (fromAccess) {
    return {
      id: fromAccess.id,
      email: fromAccess.email,
      name: fromAccess.name || fromAccess.email,
      role: fromAccess.role,
    };
  }

  const refresh = jar.get(DASHBOARD_REFRESH_COOKIE)?.value;
  const fromRefresh = await verifyRefreshToken(refresh);
  if (!fromRefresh) return null;

  return {
    id: fromRefresh.id,
    email: fromRefresh.email,
    name: fromRefresh.name || fromRefresh.email,
    role: fromRefresh.role,
  };
}

export async function isDashboardAuthenticated() {
  return (await getDashboardUser()) !== null;
}

export async function requireDashboardUser() {
  const user = await getDashboardUser();
  if (!user) {
    return { ok: false as const, status: 401 as const, error: "Unauthorized." };
  }
  return { ok: true as const, user };
}

export async function requireDashboardRole(...allowed: DashboardUserRole[]) {
  const auth = await requireDashboardUser();
  if (!auth.ok) return auth;

  if (!allowed.includes(auth.user.role)) {
    return {
      ok: false as const,
      status: 403 as const,
      error: `Forbidden. Requires one of: ${allowed.join(", ")}.`,
    };
  }

  return auth;
}
