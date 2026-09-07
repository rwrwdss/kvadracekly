import { getPayloadClient } from "@/lib/payload";
import {
  DEFAULT_PAGE_FLEET,
  DEFAULT_PAGE_TARIFFS,
  type CatalogPageDefaults,
} from "@/lib/cms/catalogPageDefaults";
import { getSeasonInfo, type SeasonInfo } from "@/lib/cms/season";

export type CatalogPageKey = "tariffs" | "fleet";

export type CatalogPageLayout = CatalogPageDefaults;

function mediaUrl(cover: unknown): string | null {
  if (!cover || typeof cover === "number" || typeof cover === "string") return null;
  const doc = cover as { url?: string | null; sizes?: { card?: { url?: string | null } } };
  return doc.sizes?.card?.url || doc.url || null;
}

function pickString(value: unknown, fallback: string): string {
  const s = typeof value === "string" ? value.trim() : "";
  return s || fallback;
}

function pickChips(
  rows: { label?: string | null }[] | null | undefined,
  fallback: string[],
): string[] {
  const list = (rows || [])
    .map((r) => String(r?.label || "").trim())
    .filter(Boolean);
  return list.length ? list : fallback;
}

type PageGroup = {
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  chips?: { label?: string | null }[] | null;
  sectionLabel?: string | null;
  sectionTitle?: string | null;
  ctaTitle?: string | null;
  ctaText?: string | null;
  cover?: unknown;
};

function mapPage(
  group: PageGroup | null | undefined,
  defaults: CatalogPageDefaults,
): CatalogPageLayout {
  return {
    title: pickString(group?.title, defaults.title),
    subtitle: pickString(group?.subtitle, defaults.subtitle),
    description: pickString(group?.description, defaults.description),
    imageUrl: mediaUrl(group?.cover) || pickString(group?.imageUrl, defaults.imageUrl),
    imageAlt: pickString(group?.imageAlt, defaults.imageAlt),
    chips: pickChips(group?.chips, defaults.chips),
    sectionLabel: pickString(group?.sectionLabel, defaults.sectionLabel),
    sectionTitle: pickString(group?.sectionTitle, defaults.sectionTitle),
    ctaTitle: pickString(group?.ctaTitle, defaults.ctaTitle),
    ctaText: pickString(group?.ctaText, defaults.ctaText),
  };
}

export async function getCatalogPageLayout(page: CatalogPageKey): Promise<CatalogPageLayout> {
  const defaults = page === "tariffs" ? DEFAULT_PAGE_TARIFFS : DEFAULT_PAGE_FLEET;
  try {
    const payload = await getPayloadClient();
    const settings = await payload.findGlobal({ slug: "site-settings", depth: 1 });
    const key = page === "tariffs" ? "pageTariffs" : "pageFleet";
    const group = (settings as unknown as Record<string, unknown>)[key] as PageGroup | undefined;
    return mapPage(group, defaults);
  } catch (err) {
    console.error("[getCatalogPageLayout]", page, err);
    return { ...defaults };
  }
}

export type CatalogLayoutBundle = {
  season: SeasonInfo;
  pageTariffs: CatalogPageLayout;
  pageFleet: CatalogPageLayout;
};

export async function getCatalogLayoutBundle(): Promise<CatalogLayoutBundle> {
  const [season, pageTariffs, pageFleet] = await Promise.all([
    getSeasonInfo(),
    getCatalogPageLayout("tariffs"),
    getCatalogPageLayout("fleet"),
  ]);
  return { season, pageTariffs, pageFleet };
}
