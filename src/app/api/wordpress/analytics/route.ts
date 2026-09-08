import { clientContextFromRequest } from "@/lib/analytics/client-context";
import { insertAnalyticsEvent } from "@/lib/analytics/storage";
import type { AnalyticsEventType } from "@/lib/analytics/types";
import { wordpressCorsJson, wordpressCorsOptions } from "@/lib/wordpress-cors";

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
  if (!expected) return true;
  const provided =
    request.headers.get("x-tz-api-key") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return provided === expected;
}

export async function POST(request: Request) {
  if (!verifyWordPressApiKey(request)) {
    return wordpressCorsJson({ ok: false, error: "Unauthorized" }, 401);
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const eventType = asString(body.eventType) as AnalyticsEventType;

    if (!ALLOWED_TYPES.includes(eventType)) {
      return wordpressCorsJson({ ok: false, error: "Invalid eventType." }, 400);
    }

    if (eventType === "cta_click" && !asString(body.ctaId)) {
      return wordpressCorsJson({ ok: false, error: "ctaId required for cta_click." }, 400);
    }

    const context = clientContextFromRequest(request);

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
      country: asString(body.country) || context.country,
      device: asString(body.device) || context.device,
      browser: asString(body.browser) || context.browser,
      meta:
        body.meta && typeof body.meta === "object"
          ? (body.meta as Record<string, unknown>)
          : {},
      source: "wordpress",
    });

    return wordpressCorsJson({ ok: true, id: event.id });
  } catch (error) {
    console.error("[api/wordpress/analytics]", error);
    return wordpressCorsJson({ ok: false, error: "Could not record event." }, 500);
  }
}

export async function OPTIONS() {
  return wordpressCorsOptions();
}
