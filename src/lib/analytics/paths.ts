import { TZ_SERVICES } from "@/lib/analytics/constants";

/** WordPress slug variants → canonical service path */
const PATH_ALIASES: Record<string, string> = {
  "/kfz-service": "/kfz-services",
};

export function normalizePath(path: string) {
  let trimmed = path.split("?")[0]?.split("#")[0]?.trim() || "/";
  if (!trimmed.startsWith("/")) trimmed = `/${trimmed}`;
  if (trimmed.length > 1 && trimmed.endsWith("/")) {
    trimmed = trimmed.slice(0, -1);
  }
  return PATH_ALIASES[trimmed] ?? trimmed;
}

export function pageLabel(path: string) {
  const normalized = normalizePath(path);
  const service = TZ_SERVICES.find((s) => normalizePath(s.path) === normalized);
  if (service) return service.label;

  const labels: Record<string, string> = {
    "/": "Startseite",
    "/kontakt": "Kontakt",
    "/ueber-uns": "Über uns",
  };
  return labels[normalized] ?? normalized;
}

export function matchesServicePath(eventPath: string, servicePath: string) {
  return normalizePath(eventPath) === normalizePath(servicePath);
}
