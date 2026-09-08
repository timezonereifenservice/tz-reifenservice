import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  DEMO_LOGIN,
  DASHBOARD_COOKIE,
  DASHBOARD_PATH,
} from "@/lib/dashboard-constants";
import { encodeSession } from "@/lib/dashboard-auth";
import { getUserDisplayName } from "@/lib/dashboard-nav";

export const runtime = "nodejs";

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const email = asString(body.email).toLowerCase();
    const password = asString(body.password);

    if (
      email !== DEMO_LOGIN.email.toLowerCase() ||
      password !== DEMO_LOGIN.password
    ) {
      return NextResponse.json(
        { ok: false, error: "Ungültige E-Mail oder Passwort." },
        { status: 401 },
      );
    }

    const token = encodeSession({
      email: DEMO_LOGIN.email,
      name: getUserDisplayName(DEMO_LOGIN.email),
    });

    const cookieStore = await cookies();
    cookieStore.set(DASHBOARD_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ ok: true, redirect: `${DASHBOARD_PATH}/overview` });
  } catch (error) {
    console.error("[api/dashboard/login]", error);
    return NextResponse.json(
      { ok: false, error: "Anmeldung fehlgeschlagen." },
      { status: 500 },
    );
  }
}
