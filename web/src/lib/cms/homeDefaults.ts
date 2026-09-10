import { IMAGES } from "@/data/site";

export type HomePageDefaults = {
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;
  tagline: string;
  imageUrl: string;
  imageAlt: string;
  /** URL фонового видео (MP4/WebM); пусто = только картинка */
  videoUrl: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  facts: string[];
  /** Короткая подсказка под кнопками героя. */
  experienceHint: string;
};

export const DEFAULT_PAGE_HOME: HomePageDefaults = {
  eyebrow: "Премиальный отдых на природе",
  titleLine1: "Погрузись в атмосферу",
  titleLine2: "аристократа с",
  tagline:
    "Вольница — место, где история усадеб встречается\nс духом настоящего приключения.",
  imageUrl: IMAGES.heroHome.src,
  imageAlt: IMAGES.heroHome.alt,
  videoUrl: "",
  primaryCtaLabel: "Смотреть уровни →",
  secondaryCtaLabel: "Записаться",
  facts: [
    "Не часы — уровни 1→4",
    "Новичок → Зелёное озеро",
    "Опыт — доступ к сложным",
    "25–30 мин от Казани",
  ],
  experienceHint:
    "Уже катался? При записи укажите опыт — подберём доступный уровень, а не старт с «Зелёного озера».",
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
