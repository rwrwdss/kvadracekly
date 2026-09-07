/**
 * Идемпотентный сид тарифов и техники из site.ts + заготовки сапы/лошади (выкл).
 * Запуск из web/: npm run seed:catalog
 */
import { getPayload } from "payload";
import config from "../src/payload.config";
import { FLEET, ROUTES } from "../src/data/site";
import { ROUTE_DURATION_MINUTES, resolveDurationMinutes } from "../src/lib/booking/slots";

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

async function upsertTariff(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any,
  data: Record<string, unknown>,
) {
  const slug = String(data.slug);
  const existing = await payload.find({
    collection: "tariffs",
    where: { slug: { equals: slug } },
    limit: 1,
    overrideAccess: true,
  });
  if (existing.docs[0]) {
    await payload.update({
      collection: "tariffs",
      id: existing.docs[0].id,
      data,
      overrideAccess: true,
    });
    console.log("tariff update", slug);
  } else {
    await payload.create({
      collection: "tariffs",
      data,
      overrideAccess: true,
    });
    console.log("tariff create", slug);
  }
}

async function upsertFleet(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any,
  data: Record<string, unknown>,
) {
  const slug = String(data.slug);
  const existing = await payload.find({
    collection: "fleet",
    where: { slug: { equals: slug } },
    limit: 1,
    overrideAccess: true,
  });
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

async function main() {
  const payload = await getPayload({ config });

  for (let i = 0; i < ROUTES.length; i++) {
    const route = ROUTES[i];
    await upsertTariff(payload, {
      title: route.title,
      slug: route.slug,
      badge: TARIFF_BADGES[i] || "Тариф",
      price: route.price,
      priceNote: route.priceNote || undefined,
      duration: route.duration,
      durationMinutes:
        ROUTE_DURATION_MINUTES[route.title] || resolveDurationMinutes(route.title),
      distance: route.distance,
      difficulty: route.difficulty,
      difficultyLabel: route.difficultyLabel,
      audience: route.audience,
      description: route.description,
      progressOrder: route.progressOrder,
      imageUrl: route.image,
      imageAlt: route.imageAlt,
      sortOrder: i + 1,
      season: "atv",
      activeForBooking: true,
      published: true,
    });
  }

  for (let i = 0; i < FLEET.length; i++) {
    const item = FLEET[i];
    const slug = fleetSlug(item.name, i);
    await upsertFleet(payload, {
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
      season: "atv",
      activeForBooking: true,
      published: true,
    });
  }

  // Заготовки «потом» — не в каталоге и без онлайн-брони
  await upsertTariff(payload, {
    title: "Сапы",
    slug: "sapy",
    badge: "Скоро",
    price: 0,
    duration: "уточняется",
    durationMinutes: 60,
    distance: "уточняется",
    difficulty: "easy",
    difficultyLabel: "Лёгкий",
    audience: "Семьи, пары",
    description: "Заготовка услуги. Онлайн-бронь пока недоступна.",
    progressOrder: 10,
    imageUrl: "/images/hero/usadba-bereginya-ozero-vecher.jpg",
    imageAlt: "Усадьба у воды — заготовка для сапов",
    sortOrder: 90,
    season: "off",
    activeForBooking: false,
    published: false,
  });

  await upsertTariff(payload, {
    title: "Лошади",
    slug: "loshadi",
    badge: "Скоро",
    price: 0,
    duration: "уточняется",
    durationMinutes: 60,
    distance: "уточняется",
    difficulty: "easy",
    difficultyLabel: "Лёгкий",
    audience: "Семьи",
    description: "Заготовка услуги. Онлайн-бронь пока недоступна.",
    progressOrder: 11,
    imageUrl: "/images/hero/usadba-bereginya-ozero-vecher.jpg",
    imageAlt: "Усадьба — заготовка для конных прогулок",
    sortOrder: 91,
    season: "off",
    activeForBooking: false,
    published: false,
  });

  await upsertFleet(payload, {
    name: "Сапы",
    slug: "sapy",
    role: "заготовка",
    color: "—",
    count: 1,
    seats: 1,
    drive: "—",
    imageUrl: "/images/hero/usadba-bereginya-ozero-vecher.jpg",
    imageAlt: "Заготовка: сапы",
    sortOrder: 90,
    season: "off",
    activeForBooking: false,
    published: false,
  });

  await upsertFleet(payload, {
    name: "Лошади",
    slug: "loshadi",
    role: "заготовка",
    color: "—",
    count: 1,
    seats: 1,
    drive: "—",
    imageUrl: "/images/hero/usadba-bereginya-ozero-vecher.jpg",
    imageAlt: "Заготовка: лошади",
    sortOrder: 91,
    season: "off",
    activeForBooking: false,
    published: false,
  });

  try {
    await payload.updateGlobal({
      slug: "site-settings",
      data: {
        season: {
          current: "atv",
          label: "Сезон квадроциклов",
          bannerText:
            "Сейчас сезон квадроциклов. Можно оставить заявку на ближайшие даты. В паузу сайт не отключается — бронируем будущий сезон.",
        },
      },
      overrideAccess: true,
    });
    console.log("site-settings season ok");
  } catch (err) {
    console.warn("site-settings season skip", err);
  }

  console.log("seed:catalog done");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
