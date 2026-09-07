import { NextRequest, NextResponse } from "next/server";
import { headers as getHeaders } from "next/headers";
import { getPayload } from "payload";
import { revalidatePath } from "next/cache";
import config from "@payload-config";
import { isAdmin } from "@/access/roles";
import {
  DEFAULT_PAGE_FLEET,
  DEFAULT_PAGE_TARIFFS,
  type CatalogPageDefaults,
} from "@/lib/cms/catalogPageDefaults";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type SeasonCurrent = "atv" | "snow" | "pause";

type PageBody = {
  title?: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  imageAlt?: string;
  chips?: { label?: string }[];
  sectionLabel?: string;
  sectionTitle?: string;
  ctaTitle?: string;
  ctaText?: string;
};

function normalizePage(input: PageBody | undefined, defaults: CatalogPageDefaults) {
  const chips = (input?.chips || [])
    .map((c) => String(c?.label || "").trim())
    .filter(Boolean)
    .map((label) => ({ label }));
  return {
    title: String(input?.title || defaults.title).trim() || defaults.title,
    subtitle: String(input?.subtitle || defaults.subtitle).trim() || defaults.subtitle,
    description: String(input?.description || defaults.description).trim() || defaults.description,
    imageUrl: String(input?.imageUrl || defaults.imageUrl).trim() || defaults.imageUrl,
    imageAlt: String(input?.imageAlt || defaults.imageAlt).trim() || defaults.imageAlt,
    chips: chips.length ? chips : defaults.chips.map((label) => ({ label })),
    sectionLabel: String(input?.sectionLabel || defaults.sectionLabel).trim() || defaults.sectionLabel,
    sectionTitle: String(input?.sectionTitle || defaults.sectionTitle).trim() || defaults.sectionTitle,
    ctaTitle: String(input?.ctaTitle || defaults.ctaTitle).trim() || defaults.ctaTitle,
    ctaText: String(input?.ctaText || defaults.ctaText).trim() || defaults.ctaText,
  };
}

async function requireAdmin() {
  const payload = await getPayload({ config });
  const headers = await getHeaders();
  const { user } = await payload.auth({ headers });
  if (!isAdmin(user)) return { payload, user: null as null };
  return { payload, user };
}

/** GET — сезон + вёрстка тарифов/техники для админ-панели. */
export async function GET() {
  const { payload, user } = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Нужна авторизация админа" }, { status: 401 });

  const settings = await payload.findGlobal({
    slug: "site-settings",
    depth: 0,
    overrideAccess: true,
  });

  const season = (settings as { season?: Record<string, unknown> }).season || {};
  const pageTariffs = (settings as { pageTariffs?: PageBody }).pageTariffs;
  const pageFleet = (settings as { pageFleet?: PageBody }).pageFleet;

  return NextResponse.json({
    season: {
      current: (["atv", "snow", "pause"].includes(String(season.current))
        ? season.current
        : "atv") as SeasonCurrent,
      label: String(season.label || "Сезон квадроциклов"),
      bannerText: String(
        season.bannerText ||
          "Сейчас сезон квадроциклов. Можно оставить заявку на ближайшие даты.",
      ),
    },
    pageTariffs: normalizePage(pageTariffs, DEFAULT_PAGE_TARIFFS),
    pageFleet: normalizePage(pageFleet, DEFAULT_PAGE_FLEET),
  });
}

/** POST — сохранить сезон и/или вёрстку страницы. Не меняет сезон, если current не передан. */
export async function POST(req: NextRequest) {
  const { payload, user } = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Нужна авторизация админа" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    season?: { current?: string; label?: string; bannerText?: string };
    pageTariffs?: PageBody;
    pageFleet?: PageBody;
  };

  const currentSettings = await payload.findGlobal({
    slug: "site-settings",
    depth: 0,
    overrideAccess: true,
  });
  const prevSeason = (currentSettings as { season?: Record<string, unknown> }).season || {};

  const data: Record<string, unknown> = {};

  if (body.season) {
    const nextCurrent = String(body.season.current || prevSeason.current || "atv");
    data.season = {
      current: (["atv", "snow", "pause"].includes(nextCurrent) ? nextCurrent : "atv") as SeasonCurrent,
      label: String(body.season.label ?? prevSeason.label ?? "Сезон квадроциклов").trim(),
      bannerText: String(
        body.season.bannerText ??
          prevSeason.bannerText ??
          "Сейчас сезон квадроциклов. Можно оставить заявку на ближайшие даты.",
      ).trim(),
    };
  }

  if (body.pageTariffs) {
    data.pageTariffs = normalizePage(body.pageTariffs, DEFAULT_PAGE_TARIFFS);
  }
  if (body.pageFleet) {
    data.pageFleet = normalizePage(body.pageFleet, DEFAULT_PAGE_FLEET);
  }

  if (!Object.keys(data).length) {
    return NextResponse.json({ error: "Нет данных для сохранения" }, { status: 400 });
  }

  await payload.updateGlobal({
    slug: "site-settings",
    data,
    overrideAccess: true,
  });

  try {
    revalidatePath("/");
    revalidatePath("/tarify");
    revalidatePath("/tehnika");
  } catch {
    /* ignore */
  }

  return NextResponse.json({ ok: true });
}
