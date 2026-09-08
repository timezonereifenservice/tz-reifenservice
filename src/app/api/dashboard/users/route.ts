import { NextResponse } from "next/server";
import { requireDashboardRole } from "@/lib/dashboard-auth";
import { createUser, listUsers } from "@/lib/dashboard-users/storage";
import {
  DASHBOARD_USER_ROLES,
  type CreateDashboardUserInput,
  type DashboardUserRole,
} from "@/lib/dashboard-users/types";

export async function GET() {
  const auth = await requireDashboardRole("Admin");
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status },
    );
  }

  try {
    const users = await listUsers();
    return NextResponse.json({ ok: true, users });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Benutzer konnten nicht geladen werden.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireDashboardRole("Admin");
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status },
    );
  }

  let body: Partial<CreateDashboardUserInput>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Ungültige Anfrage." },
      { status: 400 },
    );
  }

  const name = typeof body.name === "string" ? body.name : "";
  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";
  const role = body.role as DashboardUserRole | undefined;

  if (!name || !email || !password || !role) {
    return NextResponse.json(
      { ok: false, error: "Name, E-Mail, Passwort und Rolle sind erforderlich." },
      { status: 400 },
    );
  }

  if (!(DASHBOARD_USER_ROLES as readonly string[]).includes(role)) {
    return NextResponse.json(
      { ok: false, error: "Ungültige Rolle." },
      { status: 400 },
    );
  }

  try {
    const user = await createUser({ name, email, password, role });
    return NextResponse.json({ ok: true, user }, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Benutzer konnte nicht erstellt werden.";
    const status = /already exists/i.test(message) ? 409 : 400;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
