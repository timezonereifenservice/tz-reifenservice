import { SignJWT, jwtVerify } from "jose";
import type { DashboardUserRole } from "@/lib/dashboard-users/types";
import { isDashboardUserRole } from "@/lib/dashboard-users/profile";
import {
  ACCESS_TOKEN_MAX_AGE_SECONDS,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
} from "@/lib/dashboard-constants";

export type TokenPayload = {
  id: string;
  email: string;
  role: DashboardUserRole;
  name: string;
};

function getJwtSecret() {
  const secret =
    process.env.JWT_SECRET?.trim() ||
    process.env.DASHBOARD_SESSION_SECRET?.trim();
  if (!secret) {
    throw new Error("JWT_SECRET is not configured in .env");
  }
  return new TextEncoder().encode(secret);
}

export async function signAccessToken(user: TokenPayload): Promise<string> {
  return new SignJWT({
    email: user.email,
    role: user.role,
    name: user.name,
    typ: "access",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TOKEN_MAX_AGE_SECONDS}s`)
    .sign(getJwtSecret());
}

export async function signRefreshToken(user: TokenPayload): Promise<string> {
  return new SignJWT({
    email: user.email,
    role: user.role,
    name: user.name,
    typ: "refresh",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${REFRESH_TOKEN_MAX_AGE_SECONDS}s`)
    .sign(getJwtSecret());
}

export async function verifyAccessToken(
  token: string | undefined,
): Promise<TokenPayload | null> {
  return verifyToken(token, "access");
}

export async function verifyRefreshToken(
  token: string | undefined,
): Promise<TokenPayload | null> {
  return verifyToken(token, "refresh");
}

async function verifyToken(
  token: string | undefined,
  typ: "access" | "refresh",
): Promise<TokenPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (payload.typ !== typ) return null;
    const id = typeof payload.sub === "string" ? payload.sub : null;
    const email = typeof payload.email === "string" ? payload.email : null;
    const role = typeof payload.role === "string" ? payload.role : null;
    const name = typeof payload.name === "string" ? payload.name : "";
    if (!id || !email || !role || !isDashboardUserRole(role)) return null;
    return { id, email, role, name };
  } catch {
    return null;
  }
}
