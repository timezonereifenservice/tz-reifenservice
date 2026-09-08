import { NextResponse } from "next/server";
import { insertAnalyticsEvent } from "@/lib/analytics/storage";
import type { AnalyticsEventType } from "@/lib/analytics/types";

export const runtime = "nodejs";

const ALLOWED_TYPES: AnalyticsEventType[] = [
  "page_view",
  "cta_click",
  "consent",
];

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function verifyWordPressApiKey(request: Request) {
  const expected = process.env.WORDPRESS_API_KEY?.trim();
  if (!expected) return true; // dev mode — no key required
  const provided =
    request.headers.get("x-tz-api-key") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return provided === expected;
}

/**
 * WordPress → Dashboard analytics ingestion.
 * POST /api/wordpress/analytics
 *
 * Body: { eventType, path, ctaId?, referrer?, sessionId?, visitorId?, consentValue? }
 */
export async function POST(request: Request) {
  if (!verifyWordPressApiKey(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const eventType = asString(body.eventType) as AnalyticsEventType;

    if (!ALLOWED_TYPES.includes(eventType)) {
      return NextResponse.json(
        { ok: false, error: "Invalid eventType." },
        { status: 400 },
      );
    }

    if (eventType === "cta_click" && !asString(body.ctaId)) {
      return NextResponse.json(
        { ok: false, error: "ctaId required for cta_click." },
        { status: 400 },
      );
    }

    const event = await insertAnalyticsEvent({
      eventType,
      path: asString(body.path) || "/",
      referrer: asString(body.referrer),
      ctaId: asString(body.ctaId),
      consentValue:
        asString(body.consentValue) === "accepted" ||
        asString(body.consentValue) === "rejected"
          ? (asString(body.consentValue) as "accepted" | "rejected")
          : undefined,
      sessionId: asString(body.sessionId),
      visitorId: asString(body.visitorId),
      country: asString(body.country),
      device: asString(body.device),
      browser: asString(body.browser),
      meta:
        body.meta && typeof body.meta === "object"
          ? (body.meta as Record<string, unknown>)
          : {},
      source: "wordpress",
    });

    return NextResponse.json({ ok: true, id: event.id });
  } catch (error) {
    console.error("[api/wordpress/analytics]", error);
    return NextResponse.json(
      { ok: false, error: "Could not record event." },
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
