export const TZ_SERVICES = [
  { id: "reifen", label: "Reifenservice", path: "/reifenservice" },
  { id: "getriebe", label: "Getriebespülung", path: "/getriebespuelung" },
  { id: "kfz", label: "KFZ Service", path: "/kfz-services" },
  { id: "klima", label: "Klimaservice", path: "/klimaservice" },
  { id: "oel", label: "Ölwechsel", path: "/oelwechsel-service" },
  { id: "glas", label: "Autoglas Service", path: "/autoglas-service" },
  { id: "achs", label: "Achsvermessung", path: "/achsvermessung" },
  { id: "tuning", label: "Fahrzeugtuning", path: "/fahrzeugtuning" },
] as const;

export const CTA_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  call: "Jetzt anrufen",
  contact: "Kontaktformular",
  services: "Unsere Leistungen",
  email: "E-Mail senden",
};

export const PAGE_LABELS: Record<string, string> = {
  "/": "Startseite",
  "/kontakt": "Kontakt",
  "/ueber-uns": "Über uns",
  ...Object.fromEntries(TZ_SERVICES.map((s) => [s.path, s.label])),
};

export function formKeyLabel(formKey: string) {
  const map: Record<string, string> = {
    whatsapp: "WhatsApp Widget",
    phone: "Anruf-Button",
    "contact-form": "Kontaktformular",
    "service-inquiry": "Leistungs-Anfrage",
    email: "E-Mail Link",
  };
  if (formKey.startsWith("contact-form-cf7-")) {
    return "Contact Form 7";
  }
  return map[formKey] ?? formKey;
}
