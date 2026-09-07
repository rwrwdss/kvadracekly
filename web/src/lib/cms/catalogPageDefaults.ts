import type { Field } from "payload";
import { IMAGES } from "@/data/site";

export type CatalogPageDefaults = {
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  chips: string[];
  sectionLabel: string;
  sectionTitle: string;
  ctaTitle: string;
  ctaText: string;
};

/** Общие поля вёрстки страницы каталога (герой + секция + CTA). */
export function catalogPageLayoutFields(defaults: CatalogPageDefaults): Field[] {
  return [
    {
      name: "title",
      type: "text",
      label: "Заголовок (H1)",
      defaultValue: defaults.title,
    },
    {
      name: "subtitle",
      type: "text",
      label: "Подзаголовок",
      defaultValue: defaults.subtitle,
    },
    {
      name: "description",
      type: "textarea",
      label: "Описание под заголовком",
      defaultValue: defaults.description,
    },
    {
      name: "imageUrl",
      type: "text",
      label: "Картинка героя (путь)",
      defaultValue: defaults.imageUrl,
      admin: {
        description: "Например /images/hero/....jpg — можно заменить на зимнее фото.",
      },
    },
    {
      name: "cover",
      type: "upload",
      relationTo: "media",
      label: "Обложка героя (файл)",
      admin: { description: "Если загружена — приоритетнее пути выше." },
    },
    {
      name: "imageAlt",
      type: "text",
      label: "Alt картинки",
      defaultValue: defaults.imageAlt,
    },
    {
      name: "chips",
      type: "array",
      label: "Чипы в герое",
      labels: { singular: "Чип", plural: "Чипы" },
      defaultValue: defaults.chips.map((label) => ({ label })),
      fields: [{ name: "label", type: "text", label: "Текст", required: true }],
      admin: { description: "Короткие подписи в герое (экипировка, ТО…)." },
    },
    {
      name: "sectionLabel",
      type: "text",
      label: "Лейбл секции",
      defaultValue: defaults.sectionLabel,
    },
    {
      name: "sectionTitle",
      type: "text",
      label: "Заголовок секции",
      defaultValue: defaults.sectionTitle,
    },
    {
      name: "ctaTitle",
      type: "text",
      label: "CTA: заголовок",
      defaultValue: defaults.ctaTitle,
    },
    {
      name: "ctaText",
      type: "textarea",
      label: "CTA: текст",
      defaultValue: defaults.ctaText,
    },
  ];
}

export const DEFAULT_PAGE_TARIFFS: CatalogPageDefaults = {
  title: "Тарифы и услуги",
  subtitle: "Выберите формат приключения",
  description:
    "Цена указана за клиентский квадроцикл. В группе резервируется машина инструктора.",
  imageUrl: IMAGES.heroTariffs.src,
  imageAlt: IMAGES.heroTariffs.alt,
  chips: ["Инструктор", "Экипировка", "Топливо", "Маршрут"],
  sectionLabel: "Тарифы",
  sectionTitle: "Тарифы",
  ctaTitle: "Не можете выбрать?",
  ctaText: "Подскажем тариф под опыт и состав группы.",
};

export const DEFAULT_PAGE_FLEET: CatalogPageDefaults = {
  title: "Наша техника",
  subtitle: "Мощные. Надёжные. Готовые к приключениям",
  description:
    "На старте 8 квадроциклов: 4 грязевых и 4 прогулочных. Перед каждым выездом — подготовка, ТО и инструктаж.",
  imageUrl: IMAGES.heroFleet.src,
  imageAlt: IMAGES.heroFleet.alt,
  chips: ["Подготовка", "ТО и осмотр", "Экипировка", "Подбор под маршрут"],
  sectionLabel: "Наш парк",
  sectionTitle: "8 единиц на старте",
  ctaTitle: "Не знаете, что выбрать?",
  ctaText: "Подберём технику под опыт и маршрут. В группе — машина инструктора.",
};
