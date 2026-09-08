/**
 * Server-side visitor context: IP country (no GPS) + User-Agent platform.
 */

export type ClientPlatform = {
  device: string;
  browser: string;
  os: string;
};

const COUNTRY_NAMES: Record<string, string> = {
  DE: "Deutschland",
  AT: "Österreich",
  CH: "Schweiz",
  NL: "Niederlande",
  BE: "Belgien",
  FR: "Frankreich",
  IT: "Italien",
  ES: "Spanien",
  PL: "Polen",
  GB: "Vereinigtes Königreich",
  US: "USA",
  TR: "Türkei",
};

export function countryLabel(code: string): string {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return "Unbekannt";
  return COUNTRY_NAMES[normalized] ?? normalized;
}

export function normalizeCountryCode(raw: string | null | undefined): string {
  const code = (raw || "").trim().toUpperCase();
  if (!code || code === "XX" || code.length !== 2) return "";
  if (!/^[A-Z]{2}$/.test(code)) return "";
  return code;
}

export function countryFromHeaders(headers: Headers): string {
  return normalizeCountryCode(
    headers.get("x-vercel-ip-country") ||
      headers.get("cf-ipcountry") ||
      headers.get("x-country-code"),
  );
}

export function parseUserAgent(uaRaw: string): ClientPlatform {
  const ua = uaRaw.trim();
  if (!ua) {
    return { device: "Unbekannt", browser: "Unbekannt", os: "Unbekannt" };
  }
  const lower = ua.toLowerCase();

  let device = "Desktop";
  if (
    /ipad|tablet|playbook|silk|(android(?!.*mobile))/i.test(ua) ||
    (lower.includes("macintosh") && lower.includes("touch"))
  ) {
    device = "Tablet";
  } else if (
    /mobi|iphone|ipod|android.*mobile|blackberry|opera mini|iemobile|windows phone/i.test(
      ua,
    )
  ) {
    device = "Mobile";
  }

  let browser = "Sonstige";
  if (/edg(?:e|a|ios)?\//i.test(ua)) browser = "Edge";
  else if (/opr\/|opera/i.test(ua)) browser = "Opera";
  else if (/samsungbrowser\//i.test(ua)) browser = "Samsung Internet";
  else if (/chrome\/|crios\//i.test(ua) && !/edg/i.test(ua)) browser = "Chrome";
  else if (/firefox\/|fxios\//i.test(ua)) browser = "Firefox";
  else if (/safari\//i.test(ua) && !/chrome|crios|android/i.test(ua))
    browser = "Safari";

  let os = "Sonstige";
  if (/windows nt/i.test(ua)) os = "Windows";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/mac os x|macintosh/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua)) os = "Linux";

  return { device, browser, os };
}

export function clientContextFromRequest(request: Request): {
  country: string;
  device: string;
  browser: string;
  os: string;
} {
  const platform = parseUserAgent(request.headers.get("user-agent") || "");
  return {
    country: countryFromHeaders(request.headers),
    device: platform.device,
    browser: platform.browser,
    os: platform.os,
  };
}
