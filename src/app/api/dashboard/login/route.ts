import { NextResponse } from "next/server";
import { createTokenPair, setAuthCookies } from "@/lib/dashboard-auth";
import { authenticateUser } from "@/lib/dashboard-users/storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { email?: string; password?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Ungültige Anfrage." },
      { status: 400 },
    );
  }

  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { ok: false, error: "E-Mail und Passwort sind erforderlich." },
      { status: 400 },
    );
  }

  let result;
  try {
    result = await authenticateUser(email, password);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Anmeldedienst nicht verfügbar.";
    return NextResponse.json({ ok: false, error: message }, { status: 503 });
  }

  if (!result.ok) {
    if (result.reason === "deactivated") {
      return NextResponse.json(
        { ok: false, error: "Dieses Konto wurde deaktiviert." },
        { status: 403 },
      );
    }
    return NextResponse.json(
      { ok: false, error: "Ungültige E-Mail oder Passwort." },
      { status: 401 },
    );
  }

  const user = result.user;
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
