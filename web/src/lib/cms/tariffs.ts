import { getPayloadClient } from "@/lib/payload";
import { ROUTES, type Difficulty, type Route } from "@/data/site";
import {
  getSeasonInfo,
  isVisibleInSeason,
  type ServiceSeason,
} from "@/lib/cms/season";
import { resolveDurationMinutes } from "@/lib/booking/slots";

const FALLBACK_BADGES = ["Стандарт", "Премиум", "Премиум+", "Легенда", "Новое!"] as const;

export type TariffCard = Route & {
  badge: string;
  durationMinutes: number;
  season: ServiceSeason;
  activeForBooking: boolean;
};

function mediaUrl(cover: unknown): string | null {
  if (!cover || typeof cover === "number" || typeof cover === "string") return null;
  const doc = cover as { url?: string | null; sizes?: { card?: { url?: string | null } } };
  return doc.sizes?.card?.url || doc.url || null;
}

export async function getTariffs(): Promise<TariffCard[]> {
  const seasonInfo = await getSeasonInfo();
  try {
    const payload = await getPayloadClient();
    const { docs } = await payload.find({
      collection: "tariffs",
      where: { published: { equals: true } },
      sort: "sortOrder",
      limit: 50,
      depth: 1,
      overrideAccess: true,
    });

    if (!docs.length) return fallbackTariffs(seasonInfo.current);

    return docs
      .map((doc, i) => {
        const difficulty = (doc.difficulty || "easy") as Difficulty;
        const season = (doc.season || "atv") as ServiceSeason;
        return {
          id: String(doc.id),
          slug: String(doc.slug),
          title: String(doc.title),
          difficulty,
          difficultyLabel: String(doc.difficultyLabel || ""),
          duration: String(doc.duration),
          durationMinutes: resolveDurationMinutes(
            String(doc.title),
            typeof doc.durationMinutes === "number" ? doc.durationMinutes : null,
          ),
          distance: String(doc.distance),
          price: Number(doc.price) || 0,
          priceNote: doc.priceNote ? String(doc.priceNote) : undefined,
          audience: String(doc.audience || ""),
          description: String(doc.description),
          progressOrder: Number(doc.progressOrder) || i + 1,
          image: mediaUrl(doc.cover) || String(doc.imageUrl || ""),
          imageAlt: String(doc.imageAlt || doc.title),
          badge: String(doc.badge || FALLBACK_BADGES[i] || "Тариф"),
          season,
          activeForBooking: doc.activeForBooking !== false,
        };
      })
      .filter((t) => isVisibleInSeason(t.season, seasonInfo.current));
  } catch (err) {
    console.error("[getTariffs]", err);
    return fallbackTariffs(seasonInfo.current);
  }
}

function fallbackTariffs(current: "atv" | "snow" | "pause"): TariffCard[] {
  return ROUTES.map((route, i) => ({
    ...route,
    badge: route.badge || FALLBACK_BADGES[i] || "Тариф",
    durationMinutes: resolveDurationMinutes(route.title),
    season: "atv" as ServiceSeason,
    activeForBooking: true,
  })).filter((t) => isVisibleInSeason(t.season, current));
}
