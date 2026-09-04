import type { Metadata } from "next";
import { getPayloadClient, mediaUrl, type MediaDoc } from "@/lib/payload";
import { GALLERY_CATEGORIES, GALLERY_SEED } from "@/data/site";
import { GalleryClient } from "@/components/gallery/GalleryClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Галерея",
  description: "Живые фото маршрутов и базы Вольница.",
};

type GalleryItem = {
  id: string;
  title: string;
  category: string;
  src: string;
  alt: string;
};

async function getGallery(): Promise<{
  items: GalleryItem[];
  intro: { title: string; subtitle: string; description: string };
}> {
  const fallbackIntro = {
    title: "Галерея",
    subtitle: "Атмосфера свободы и приключений",
    description:
      "Живые кадры с маршрутов и базы Вольницы. Новые фото можно добавлять через CMS.",
  };

  try {
    const payload = await getPayloadClient();
    const [gallery, settings] = await Promise.all([
      payload.find({
        collection: "gallery",
        where: { published: { equals: true } },
        sort: "sortOrder",
        depth: 1,
        limit: 200,
      }),
      payload.findGlobal({ slug: "site-settings", depth: 0 }),
    ]);

    const cmsItems: GalleryItem[] = gallery.docs
      .map((doc) => {
        const image = doc.image as MediaDoc | number | null;
        const src = mediaUrl(image);
        if (!src) return null;
        return {
          id: String(doc.id),
          title: doc.title,
          category: String(doc.category),
          src,
          alt: (typeof image === "object" && image?.alt) || doc.title,
        };
      })
      .filter(Boolean) as GalleryItem[];

    return {
      items: cmsItems.length > 0 ? cmsItems : [...GALLERY_SEED],
      intro: {
        title: settings?.galleryIntro?.title || fallbackIntro.title,
        subtitle: settings?.galleryIntro?.subtitle || fallbackIntro.subtitle,
        description: settings?.galleryIntro?.description || fallbackIntro.description,
      },
    };
  } catch {
    return { items: [...GALLERY_SEED], intro: fallbackIntro };
  }
}

export default async function GalleryPage() {
  const { items, intro } = await getGallery();

  return (
    <GalleryClient
      items={items}
      categories={[...GALLERY_CATEGORIES]}
      intro={intro}
    />
  );
}
