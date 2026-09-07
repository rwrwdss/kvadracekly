import { getPayloadClient } from "@/lib/payload";
import { FLEET, type FleetItem } from "@/data/site";

function mediaUrl(cover: unknown): string | null {
  if (!cover || typeof cover === "number" || typeof cover === "string") return null;
  const doc = cover as { url?: string | null; sizes?: { card?: { url?: string | null } } };
  return doc.sizes?.card?.url || doc.url || null;
}

export async function getFleet(): Promise<FleetItem[]> {
  try {
    const payload = await getPayloadClient();
    const { docs } = await payload.find({
      collection: "fleet",
      where: { published: { equals: true } },
      sort: "sortOrder",
      limit: 50,
      depth: 1,
      overrideAccess: true,
    });

    if (!docs.length) return FLEET;

    return docs.map((doc) => ({
      id: String(doc.id),
      name: String(doc.name),
      role: String(doc.role),
      color: String(doc.color),
      count: Number(doc.count) || 1,
      seats: Number(doc.seats) || 2,
      drive: String(doc.drive || "4×4"),
      image: mediaUrl(doc.cover) || String(doc.imageUrl || ""),
      imageAlt: String(doc.imageAlt || doc.name),
    }));
  } catch (err) {
    console.error("[getFleet]", err);
    return FLEET;
  }
}
