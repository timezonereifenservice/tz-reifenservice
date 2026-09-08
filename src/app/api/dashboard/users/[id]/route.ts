import { NextResponse } from "next/server";
import { requireDashboardRole } from "@/lib/dashboard-auth";
import {
  deleteUser,
  getUserById,
  updateUser,
} from "@/lib/dashboard-users/storage";
import {
  DASHBOARD_USER_ROLES,
  type DashboardUserRole,
} from "@/lib/dashboard-users/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireDashboardRole("Admin");
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status },
    );
  }

  const { id } = await context.params;
  let body: { name?: string; role?: string; password?: string; isActive?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Ungültige Anfrage." },
      { status: 400 },
    );
  }

  if (
    body.role !== undefined &&
    !(DASHBOARD_USER_ROLES as readonly string[]).includes(body.role)
  ) {
    return NextResponse.json(
      { ok: false, error: "Ungültige Rolle." },
      { status: 400 },
    );
  }

  if (body.isActive === false && auth.user.id === id) {
    return NextResponse.json(
      { ok: false, error: "Sie können Ihr eigenes Konto nicht deaktivieren." },
      { status: 400 },
    );
  }

  try {
    const user = await updateUser(id, {
      name: body.name,
      role: body.role as DashboardUserRole | undefined,
      password: body.password,
      isActive: typeof body.isActive === "boolean" ? body.isActive : undefined,
    });
    return NextResponse.json({ ok: true, user });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Benutzer konnte nicht aktualisiert werden.";
    const status = /not found/i.test(message) ? 404 : 400;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireDashboardRole("Admin");
  if (!auth.ok) {
    return NextResponse.json(
      { ok: false, error: auth.error },
      { status: auth.status },
    );
  }

  const { id } = await context.params;

  if (auth.user.id === id) {
    return NextResponse.json(
      { ok: false, error: "Sie können Ihr eigenes Konto nicht löschen." },
      { status: 400 },
    );
  }

  try {
    await deleteUser(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Benutzer konnte nicht gelöscht werden.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
