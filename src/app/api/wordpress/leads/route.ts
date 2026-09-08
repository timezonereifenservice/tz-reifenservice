import { NextResponse } from "next/server";
import { createLead } from "@/lib/leads/storage";
import type { LeadType } from "@/lib/leads/types";

export const runtime = "nodejs";

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function verifyWordPressApiKey(request: Request) {
  const expected = process.env.WORDPRESS_API_KEY?.trim();
  if (!expected) return true;
  const provided =
    request.headers.get("x-tz-api-key") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return provided === expected;
}

function resolveLeadType(formKey: string, typeHint?: string): LeadType {
  const hint = typeHint?.toLowerCase() ?? formKey.toLowerCase();
  if (hint.includes("whatsapp")) return "whatsapp";
  if (hint.includes("phone") || hint.includes("call") || hint.includes("anruf")) {
    return "phone";
  }
  if (hint.includes("service") || hint.includes("leistung")) return "service";
  return "contact";
}

/**
 * WordPress → Dashboard lead ingestion.
 * POST /api/wordpress/leads
 *
 * Body: { formKey, fullName?, email?, phone?, service?, message?, sourcePage?, sourceLabel?, type? }
 */
export async function POST(request: Request) {
  if (!verifyWordPressApiKey(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;

    // Honeypot for WP forms
    if (asString(body.website)) {
      return NextResponse.json({ ok: true });
    }

    const formKey = asString(body.formKey) || "contact-form";
    const email = asString(body.email);
    const phone = asString(body.phone);
    const fullName = asString(body.fullName) || asString(body.name);

    if (!email && !phone && !fullName) {
      return NextResponse.json(
        { ok: false, error: "At least name, email, or phone is required." },
        { status: 400 },
      );
    }

    const lead = await createLead({
      type: resolveLeadType(formKey, asString(body.type)),
      formKey,
      sourcePage: asString(body.sourcePage) || asString(body.page),
      sourceLabel: asString(body.sourceLabel) || formKey,
      fullName,
      email,
      phone,
      service: asString(body.service) || asString(body.subject),
      message: asString(body.message),
      source: "wordpress",
    });

    return NextResponse.json({ ok: true, id: lead.id });
  } catch (error) {
    console.error("[api/wordpress/leads]", error);
    return NextResponse.json(
      { ok: false, error: "Could not save lead." },
      { status: 500 },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-TZ-API-Key, Authorization",
    },
  });
}
