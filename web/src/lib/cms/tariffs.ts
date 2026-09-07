import { getPayloadClient } from "@/lib/payload";
import { ROUTES, type Difficulty, type Route } from "@/data/site";

const FALLBACK_BADGES = ["Стандарт", "Премиум", "Премиум+", "Легенда"] as const;

export type TariffCard = Route & { badge: string };

function mediaUrl(cover: unknown): string | null {
  if (!cover || typeof cover === "number" || typeof cover === "string") return null;
  const doc = cover as { url?: string | null; sizes?: { card?: { url?: string | null } } };
  return doc.sizes?.card?.url || doc.url || null;
}

export async function getTariffs(): Promise<TariffCard[]> {
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

    if (!docs.length) return fallbackTariffs();

    return docs.map((doc, i) => {
      const difficulty = (doc.difficulty || "easy") as Difficulty;
      return {
        id: String(doc.id),
        slug: String(doc.slug),
        title: String(doc.title),
        difficulty,
        difficultyLabel: String(doc.difficultyLabel || ""),
        duration: String(doc.duration),
        distance: String(doc.distance),
        price: Number(doc.price) || 0,
        priceNote: doc.priceNote ? String(doc.priceNote) : undefined,
        audience: String(doc.audience || ""),
        description: String(doc.description),
        progressOrder: Number(doc.progressOrder) || i + 1,
        image: mediaUrl(doc.cover) || String(doc.imageUrl || ""),
        imageAlt: String(doc.imageAlt || doc.title),
        badge: String(doc.badge || FALLBACK_BADGES[i] || "Тариф"),
      };
    });
  } catch (err) {
    console.error("[getTariffs]", err);
    return fallbackTariffs();
  }
}

function fallbackTariffs(): TariffCard[] {
  return ROUTES.map((route, i) => ({
    ...route,
    badge: FALLBACK_BADGES[i] || "Тариф",
  }));
}
