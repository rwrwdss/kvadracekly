import { NextRequest, NextResponse } from "next/server";
import { headers as getHeaders } from "next/headers";
import { getPayload } from "payload";
import { revalidatePath } from "next/cache";
import config from "@payload-config";
import { isAdmin } from "@/access/roles";
import {
  DEFAULT_GALLERY_INTRO,
  DEFAULT_PAGE_HOME,
  type GalleryIntroDefaults,
  type HomePageDefaults,
} from "@/lib/cms/homeDefaults";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type HomeBody = Partial<{
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;
  tagline: string;
  imageUrl: string;
  imageAlt: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  facts: { label?: string }[];
  experienceHint: string;
}>;

type IntroBody = Partial<{
  title: string;
  subtitle: string;
  description: string;
}>;

function normalizeHome(input: HomeBody | undefined): HomePageDefaults {
  const facts = (input?.facts || [])
    .map((f) => String(f?.label || "").trim())
    .filter(Boolean);
  return {
    eyebrow: String(input?.eyebrow || DEFAULT_PAGE_HOME.eyebrow).trim() || DEFAULT_PAGE_HOME.eyebrow,
    titleLine1:
      String(input?.titleLine1 || DEFAULT_PAGE_HOME.titleLine1).trim() ||
      DEFAULT_PAGE_HOME.titleLine1,
    titleLine2:
      String(input?.titleLine2 || DEFAULT_PAGE_HOME.titleLine2).trim() ||
      DEFAULT_PAGE_HOME.titleLine2,
    tagline: String(input?.tagline || DEFAULT_PAGE_HOME.tagline).trim() || DEFAULT_PAGE_HOME.tagline,
    imageUrl:
      String(input?.imageUrl || DEFAULT_PAGE_HOME.imageUrl).trim() || DEFAULT_PAGE_HOME.imageUrl,
    imageAlt:
      String(input?.imageAlt || DEFAULT_PAGE_HOME.imageAlt).trim() || DEFAULT_PAGE_HOME.imageAlt,
    primaryCtaLabel:
      String(input?.primaryCtaLabel || DEFAULT_PAGE_HOME.primaryCtaLabel).trim() ||
      DEFAULT_PAGE_HOME.primaryCtaLabel,
    secondaryCtaLabel:
      String(input?.secondaryCtaLabel || DEFAULT_PAGE_HOME.secondaryCtaLabel).trim() ||
      DEFAULT_PAGE_HOME.secondaryCtaLabel,
    facts: facts.length ? facts : [...DEFAULT_PAGE_HOME.facts],
    experienceHint:
      String(input?.experienceHint || DEFAULT_PAGE_HOME.experienceHint).trim() ||
      DEFAULT_PAGE_HOME.experienceHint,
  };
}

function normalizeIntro(input: IntroBody | undefined): GalleryIntroDefaults {
  return {
    title: String(input?.title || DEFAULT_GALLERY_INTRO.title).trim() || DEFAULT_GALLERY_INTRO.title,
    subtitle:
      String(input?.subtitle || DEFAULT_GALLERY_INTRO.subtitle).trim() ||
      DEFAULT_GALLERY_INTRO.subtitle,
    description:
      String(input?.description || DEFAULT_GALLERY_INTRO.description).trim() ||
      DEFAULT_GALLERY_INTRO.description,
  };
}

async function requireAdmin() {
  const payload = await getPayload({ config });
  const headers = await getHeaders();
  const { user } = await payload.auth({ headers });
  if (!isAdmin(user)) return { payload, user: null as null };
  return { payload, user };
}

/** GET — тексты героя главной и intro галереи. Пустые поля заполняем дефолтами и пишем в БД. */
export async function GET() {
  const { payload, user } = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Нужна авторизация админа" }, { status: 401 });

  const settings = await payload.findGlobal({
    slug: "site-settings",
    depth: 0,
    overrideAccess: true,
  });

  const pageHomeRaw = (settings as { pageHome?: HomeBody }).pageHome;
  const galleryIntroRaw = (settings as { galleryIntro?: IntroBody }).galleryIntro;

  const home = normalizeHome(pageHomeRaw);
  const galleryIntro = normalizeIntro(galleryIntroRaw);

  const homeEmpty =
    !String(pageHomeRaw?.titleLine1 || "").trim() ||
    !String(pageHomeRaw?.titleLine2 || "").trim() ||
    !String(pageHomeRaw?.eyebrow || "").trim();
  const introEmpty =
    !String(galleryIntroRaw?.title || "").trim() ||
    !String(galleryIntroRaw?.description || "").trim();

  if (homeEmpty || introEmpty) {
    await payload.updateGlobal({
      slug: "site-settings",
      data: {
        ...(homeEmpty
          ? {
              pageHome: {
                eyebrow: home.eyebrow,
                titleLine1: home.titleLine1,
                titleLine2: home.titleLine2,
                tagline: home.tagline,
                imageUrl: home.imageUrl,
                imageAlt: home.imageAlt,
                primaryCtaLabel: home.primaryCtaLabel,
                secondaryCtaLabel: home.secondaryCtaLabel,
                experienceHint: home.experienceHint,
                facts: home.facts.map((label) => ({ label })),
              },
            }
          : {}),
        ...(introEmpty ? { galleryIntro } : {}),
      },
      overrideAccess: true,
    });
  }

  return NextResponse.json({
    pageHome: {
      ...home,
      facts: home.facts.map((label) => ({ label })),
    },
    galleryIntro,
  });
}

/** POST — сохранить герой главной и/или тексты галереи. */
export async function POST(req: NextRequest) {
  const { payload, user } = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Нужна авторизация админа" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    pageHome?: HomeBody;
    galleryIntro?: IntroBody;
  };

  const data: Record<string, unknown> = {};

  if (body.pageHome) {
    const home = normalizeHome(body.pageHome);
    data.pageHome = {
      eyebrow: home.eyebrow,
      titleLine1: home.titleLine1,
      titleLine2: home.titleLine2,
      tagline: home.tagline,
      imageUrl: home.imageUrl,
      imageAlt: home.imageAlt,
      primaryCtaLabel: home.primaryCtaLabel,
      secondaryCtaLabel: home.secondaryCtaLabel,
      experienceHint: home.experienceHint,
      facts: home.facts.map((label) => ({ label })),
    };
  }

  if (body.galleryIntro) {
    data.galleryIntro = normalizeIntro(body.galleryIntro);
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
    revalidatePath("/galereya");
  } catch {
    /* ignore */
  }

  return NextResponse.json({ ok: true });
}
