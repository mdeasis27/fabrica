import type { Locale } from "@/design-system/i18n/locale";

const COPY: Record<string, { en: string; es: string }> = {
  "batch.1": { en: "messages 1 to 6 compared", es: "mensajes 1 a 6 comparados" },
  "batch.2": { en: "messages 7 to 12 compared", es: "mensajes 7 a 12 comparados" },
  "batch.3": { en: "messages 13 to 18 compared", es: "mensajes 13 a 18 comparados" },
  "batch.4": { en: "messages 19 to 24 compared", es: "mensajes 19 a 24 comparados" },
  "batch.5": { en: "messages 25 to 30 compared", es: "mensajes 25 a 30 comparados" },
};
export function traceCopy(locale: Locale, key: string) { return COPY[key]?.[locale] ?? key; }
