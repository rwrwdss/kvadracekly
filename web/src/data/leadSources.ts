/** Источники заявки: «откуда о нас узнали» (CRM + форма бронирования). */
export const LEAD_SOURCES = [
  { value: "manor_bereginya", label: "Проживаю в Усадьбе «Берегиня»" },
  { value: "crm_site_call", label: "Звонок с сайта" },
  { value: "crm_social", label: "Соцсети" },
  { value: "friends", label: "Друзья / рекомендации" },
  { value: "search", label: "Поиск / интернет" },
  { value: "crm_other", label: "Другое" },
] as const;

export type LeadSourceValue = (typeof LEAD_SOURCES)[number]["value"];

export function leadSourceLabel(value: string | null | undefined): string {
  const found = LEAD_SOURCES.find((s) => s.value === value);
  return found?.label || value || "—";
}
