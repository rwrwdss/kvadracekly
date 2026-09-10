import { getPayloadClient, mediaUrl, type MediaDoc } from "@/lib/payload";
import {
  DEFAULT_GALLERY_INTRO,
  DEFAULT_PAGE_HOME,
  type GalleryIntroDefaults,
  type HomePageDefaults,
} from "@/lib/cms/homeDefaults";

export type HomePageLayout = HomePageDefaults;
export type GalleryIntro = GalleryIntroDefaults;

function pickString(value: unknown, fallback: string): string {
  const s = typeof value === "string" ? value.trim() : "";
  return s || fallback;
}

function pickFacts(
  rows: { label?: string | null }[] | null | undefined,
  fallback: string[],
): string[] {
  const list = (rows || [])
    .map((r) => String(r?.label || "").trim())
    .filter(Boolean);
  return list.length ? list : fallback;
}

function mediaDocUrl(cover: unknown): string | null {
  if (!cover || typeof cover === "number" || typeof cover === "string") return null;
  const doc = cover as {
    url?: string | null;
    mimeType?: string | null;
    sizes?: { card?: { url?: string | null }; hero?: { url?: string | null } };
  };
  return doc.sizes?.hero?.url || doc.sizes?.card?.url || doc.url || null;
}

function pickMediaType(value: unknown): "image" | "video" {
  return value === "video" ? "video" : "image";
}

export async function getHomePageLayout(): Promise<HomePageLayout> {
  try {
    const payload = await getPayloadClient();
    const settings = await payload.findGlobal({ slug: "site-settings", depth: 1 });
    const home = (settings as { pageHome?: Record<string, unknown> }).pageHome;
    const mediaType = pickMediaType(home?.heroMediaType);
    const imageUrl =
      mediaDocUrl(home?.cover) || pickString(home?.imageUrl, DEFAULT_PAGE_HOME.imageUrl);
    const videoUrl =
      mediaDocUrl(home?.heroVideo) || pickString(home?.heroVideoUrl, DEFAULT_PAGE_HOME.videoUrl);
    const useVideo = mediaType === "video" && Boolean(videoUrl);
    return {
      eyebrow: pickString(home?.eyebrow, DEFAULT_PAGE_HOME.eyebrow),
      titleLine1: pickString(home?.titleLine1, DEFAULT_PAGE_HOME.titleLine1),
      titleLine2: pickString(home?.titleLine2, DEFAULT_PAGE_HOME.titleLine2),
      tagline: pickString(home?.tagline, DEFAULT_PAGE_HOME.tagline),
      mediaType: useVideo ? "video" : "image",
      imageUrl,
      imageAlt: pickString(home?.imageAlt, DEFAULT_PAGE_HOME.imageAlt),
      videoUrl: useVideo ? videoUrl : "",
      primaryCtaLabel: pickString(home?.primaryCtaLabel, DEFAULT_PAGE_HOME.primaryCtaLabel),
      secondaryCtaLabel: pickString(
        home?.secondaryCtaLabel,
        DEFAULT_PAGE_HOME.secondaryCtaLabel,
      ),
      facts: pickFacts(
        home?.facts as { label?: string | null }[] | undefined,
        DEFAULT_PAGE_HOME.facts,
      ),
      experienceHint: pickString(home?.experienceHint, DEFAULT_PAGE_HOME.experienceHint),
    };
  } catch (err) {
    console.error("[getHomePageLayout]", err);
    return { ...DEFAULT_PAGE_HOME };
  }
}

export async function getGalleryIntro(): Promise<GalleryIntro> {
  try {
    const payload = await getPayloadClient();
    const settings = await payload.findGlobal({ slug: "site-settings", depth: 0 });
    const intro = (settings as { galleryIntro?: Partial<GalleryIntro> }).galleryIntro;
    return {
      title: pickString(intro?.title, DEFAULT_GALLERY_INTRO.title),
      subtitle: pickString(intro?.subtitle, DEFAULT_GALLERY_INTRO.subtitle),
      description: pickString(intro?.description, DEFAULT_GALLERY_INTRO.description),
    };
  } catch {
    return { ...DEFAULT_GALLERY_INTRO };
  }
}

export type HomeCarouselItem = {
  id: string;
  title: string;
  src: string;
  alt: string;
};

/** Фото для карусели на главной — опубликованные из CMS «Галерея». */
export async function getHomeCarousel(limit = 12): Promise<HomeCarouselItem[]> {
  try {
    const payload = await getPayloadClient();
    const { docs } = await payload.find({
      collection: "gallery",
      where: { published: { equals: true } },
      sort: "sortOrder",
      depth: 1,
      limit,
      overrideAccess: true,
    });
    return docs
      .map((doc) => {
        const image = doc.image as MediaDoc | number | null;
        const src = mediaUrl(image);
        if (!src) return null;
        return {
          id: String(doc.id),
          title: String(doc.title || ""),
          src,
          alt: (typeof image === "object" && image?.alt) || String(doc.title || "Фото"),
        };
      })
      .filter(Boolean) as HomeCarouselItem[];
  } catch (err) {
    console.error("[getHomeCarousel]", err);
    return [];
  }
}
