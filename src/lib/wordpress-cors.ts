import { NextResponse } from "next/server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-TZ-API-Key, Authorization",
};

export function wordpressCorsJson(
  body: Record<string, unknown>,
  status = 200,
) {
  return NextResponse.json(body, { status, headers: CORS_HEADERS });
}

export function wordpressCorsOptions() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
