import { getPayloadClient } from "@/lib/payload";

export type SeasonCurrent = "atv" | "snow" | "pause";
export type ServiceSeason = "atv" | "snow" | "all" | "future" | "off";

export type SeasonInfo = {
  current: SeasonCurrent;
  label: string;
  bannerText: string;
};

const DEFAULT_SEASON: SeasonInfo = {
  current: "atv",
  label: "Сезон квадроциклов",
  bannerText: "Сейчас сезон квадроциклов. Можно оставить заявку на ближайшие даты.",
};

export async function getSeasonInfo(): Promise<SeasonInfo> {
  try {
    const payload = await getPayloadClient();
    const settings = await payload.findGlobal({ slug: "site-settings", depth: 0 });
    const season = (settings as { season?: Partial<SeasonInfo> | null }).season;
    const current = (season?.current || "atv") as SeasonCurrent;
    return {
      current: ["atv", "snow", "pause"].includes(current) ? current : "atv",
      label: String(season?.label || DEFAULT_SEASON.label),
      bannerText: String(season?.bannerText || DEFAULT_SEASON.bannerText),
    };
  } catch (err) {
    console.error("[getSeasonInfo]", err);
    return DEFAULT_SEASON;
  }
}

/** Показывать карточку в каталоге текущего сезона. */
export function isVisibleInSeason(
  itemSeason: ServiceSeason | string | null | undefined,
  current: SeasonCurrent,
): boolean {
  const s = (itemSeason || "atv") as ServiceSeason;
  if (s === "off") return false;
  if (s === "all" || s === "future") return true;
  if (current === "pause") return true;
  return s === current;
}
