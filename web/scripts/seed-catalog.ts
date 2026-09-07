/**
 * Идемпотентный сид тарифов и техники из site.ts (1:1 как на сайте сейчас).
 * Запуск из web/: npm run seed:catalog
 */
import { getPayload } from "payload";
import config from "../src/payload.config";
import { FLEET, ROUTES } from "../src/data/site";

const TARIFF_BADGES = ["Стандарт", "Премиум", "Премиум+", "Легенда"] as const;

const FLEET_SLUGS = [
  "kapitan",
  "aodes-520l",
  "cforce-525l",
  "cforce-520l",
  "hammer-200l",
  "hammer-300l",
] as const;

function fleetSlug(name: string, index: number): string {
  if (FLEET_SLUGS[index]) return FLEET_SLUGS[index];
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "");
  return base || `fleet-${index + 1}`;
}

async function main() {
  const payload = await getPayload({ config });

  for (let i = 0; i < ROUTES.length; i++) {
    const route = ROUTES[i];
    const existing = await payload.find({
      collection: "tariffs",
      where: { slug: { equals: route.slug } },
      limit: 1,
      overrideAccess: true,
    });

    const data = {
      title: route.title,
      slug: route.slug,
      badge: TARIFF_BADGES[i] || "Тариф",
      price: route.price,
      priceNote: route.priceNote || undefined,
      duration: route.duration,
      distance: route.distance,
      difficulty: route.difficulty,
      difficultyLabel: route.difficultyLabel,
      audience: route.audience,
      description: route.description,
      progressOrder: route.progressOrder,
      imageUrl: route.image,
      imageAlt: route.imageAlt,
      sortOrder: i + 1,
      published: true,
    };

    if (existing.docs[0]) {
      await payload.update({
        collection: "tariffs",
        id: existing.docs[0].id,
        data,
        overrideAccess: true,
      });
      console.log("tariff update", route.slug);
    } else {
      await payload.create({
        collection: "tariffs",
        data,
        overrideAccess: true,
      });
      console.log("tariff create", route.slug);
    }
  }

  for (let i = 0; i < FLEET.length; i++) {
    const item = FLEET[i];
    const slug = fleetSlug(item.name, i);
    const existing = await payload.find({
      collection: "fleet",
      where: { slug: { equals: slug } },
      limit: 1,
      overrideAccess: true,
    });

    const data = {
      name: item.name,
      slug,
      role: item.role,
      color: item.color,
      count: item.count,
      seats: item.seats,
      drive: item.drive,
      imageUrl: item.image,
      imageAlt: item.imageAlt,
      sortOrder: i + 1,
      published: true,
    };

    if (existing.docs[0]) {
      await payload.update({
        collection: "fleet",
        id: existing.docs[0].id,
        data,
        overrideAccess: true,
      });
      console.log("fleet update", slug);
    } else {
      await payload.create({
        collection: "fleet",
        data,
        overrideAccess: true,
      });
      console.log("fleet create", slug);
    }
  }

  console.log("seed:catalog done");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
