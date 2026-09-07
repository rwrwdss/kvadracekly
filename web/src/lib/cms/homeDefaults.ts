import { IMAGES, SITE } from "@/data/site";

export type HomePageDefaults = {
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;
  tagline: string;
  imageUrl: string;
  imageAlt: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  facts: string[];
};

export const DEFAULT_PAGE_HOME: HomePageDefaults = {
  eyebrow: "Премиальный отдых на природе",
  titleLine1: "Прокат",
  titleLine2: "квадроциклов",
  tagline: SITE.tagline,
  imageUrl: IMAGES.heroHome.src,
  imageAlt: IMAGES.heroHome.alt,
  primaryCtaLabel: "Выбрать маршрут →",
  secondaryCtaLabel: "Забронировать",
  facts: [
    "25–30 мин от Казани",
    "8 мощных квадроциклов",
    "Авторские маршруты",
    "Ночные выезды",
  ],
};

export type GalleryIntroDefaults = {
  title: string;
  subtitle: string;
  description: string;
};

export const DEFAULT_GALLERY_INTRO: GalleryIntroDefaults = {
  title: "Галерея",
  subtitle: "Атмосфера свободы и приключений",
  description:
    "Живые кадры с маршрутов и базы Вольницы. Новые фото можно добавлять через CMS.",
};
