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
      label: "Главный заголовок страницы",
      defaultValue: defaults.title,
      admin: {
        description: `Сейчас на сайте: «${defaults.title}»`,
      },
    },
    {
      name: "subtitle",
      type: "text",
      label: "Подзаголовок",
      defaultValue: defaults.subtitle,
      admin: {
        description: `Сейчас на сайте: «${defaults.subtitle}»`,
      },
    },
    {
      name: "description",
      type: "textarea",
      label: "Текст под заголовком",
      defaultValue: defaults.description,
      admin: {
        description: `Сейчас на сайте: «${defaults.description}»`,
      },
    },
    {
      name: "imageUrl",
      type: "text",
      label: "Картинка фона первого экрана",
      defaultValue: defaults.imageUrl,
      admin: {
        description: "Превью и кнопка «Заменить фотографию». Путь — запасной вариант.",
        components: {
          Field: "./admin/components/ImagePathField#ImagePathField",
        },
      },
    },
    {
      name: "cover",
      type: "upload",
      relationTo: "media",
      label: "Загруженная картинка фона (Media)",
      admin: {
        description: "Если задана — имеет приоритет над путём.",
      },
      filterOptions: {
        mimeType: { contains: "image" },
      },
    },
    {
      name: "imageAlt",
      type: "text",
      label: "Описание картинки (для слабовидящих)",
      defaultValue: defaults.imageAlt,
      admin: {
        description: `Сейчас: «${defaults.imageAlt}»`,
      },
    },
    {
      name: "chips",
      type: "array",
      label: "Короткие подписи на первом экране",
      labels: { singular: "Подпись", plural: "Подписи" },
      defaultValue: defaults.chips.map((label) => ({ label })),
      fields: [{ name: "label", type: "text", label: "Текст подписи", required: true }],
      admin: {
        description: `Сейчас: ${defaults.chips.join(" · ")}`,
      },
    },
    {
      name: "sectionLabel",
      type: "text",
      label: "Мелкий лейбл над списком",
      defaultValue: defaults.sectionLabel,
      admin: {
        description: `Сейчас: «${defaults.sectionLabel}»`,
      },
    },
    {
      name: "sectionTitle",
      type: "text",
      label: "Заголовок над списком",
      defaultValue: defaults.sectionTitle,
      admin: {
        description: `Сейчас: «${defaults.sectionTitle}»`,
      },
    },
    {
      name: "ctaTitle",
      type: "text",
      label: "Заголовок нижнего блока «записаться»",
      defaultValue: defaults.ctaTitle,
      admin: {
        description: `Сейчас: «${defaults.ctaTitle}»`,
      },
    },
    {
      name: "ctaText",
      type: "textarea",
      label: "Текст нижнего блока",
      defaultValue: defaults.ctaText,
      admin: {
        description: `Сейчас: «${defaults.ctaText}»`,
      },
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
