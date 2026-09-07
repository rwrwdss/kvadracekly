import type { CollectionConfig } from "payload";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/access/roles";

function revalidateTariffs() {
  try {
    revalidatePath("/tarify");
  } catch {
    /* outside Next request context (migrate/seed) */
  }
}

export const Tariffs: CollectionConfig = {
  slug: "tariffs",
  labels: { singular: "Тариф", plural: "Тарифы" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "price", "durationMinutes", "season", "published", "sortOrder"],
    group: "Сайт",
    description: "Карточки на странице /tarify. Порядок — по полю «Порядок».",
  },
  access: {
    read: () => true,
    create: ({ req }) => isAdmin(req.user),
    update: ({ req }) => isAdmin(req.user),
    delete: ({ req }) => isAdmin(req.user),
  },
  hooks: {
    afterChange: [() => revalidateTariffs()],
    afterDelete: [() => revalidateTariffs()],
  },
  fields: [
    {
      name: "title",
      type: "text",
      label: "Название",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      label: "Slug",
      required: true,
      unique: true,
      admin: { description: "Например: zelenoe-ozero" },
    },
    {
      name: "badge",
      type: "text",
      label: "Бейдж",
      admin: { description: "Стандарт / Премиум / Премиум+ / Легенда" },
    },
    {
      name: "price",
      type: "number",
      label: "Цена, ₽",
      required: true,
      min: 0,
    },
    {
      name: "priceNote",
      type: "text",
      label: "Пояснение к цене",
    },
    {
      name: "duration",
      type: "text",
      label: "Длительность",
      required: true,
    },
    {
      name: "durationMinutes",
      type: "number",
      label: "Длительность, минуты",
      required: true,
      defaultValue: 60,
      min: 30,
      max: 480,
      admin: {
        description: "Для расчёта слотов: 60 / 90 / 120 / 180.",
      },
    },
    {
      name: "distance",
      type: "text",
      label: "Дистанция",
      required: true,
    },
    {
      name: "difficulty",
      type: "select",
      label: "Сложность",
      required: true,
      defaultValue: "easy",
      options: [
        { label: "Лёгкий", value: "easy" },
        { label: "Средний", value: "medium" },
        { label: "Сложный", value: "hard" },
      ],
    },
    {
      name: "difficultyLabel",
      type: "text",
      label: "Подпись сложности",
      required: true,
      admin: { description: "Как на сайте: Лёгкий, Средний, Средний+, Сложный" },
    },
    {
      name: "audience",
      type: "text",
      label: "Для кого",
    },
    {
      name: "description",
      type: "textarea",
      label: "Описание",
      required: true,
    },
    {
      name: "progressOrder",
      type: "number",
      label: "Порядок прогресса",
      defaultValue: 1,
      min: 1,
      max: 10,
      admin: { description: "Для доступа по прогрессу клиента (как у маршрутов)." },
    },
    {
      name: "imageUrl",
      type: "text",
      label: "Картинка (путь)",
      admin: {
        description: "Например /images/routes/....jpg — если нет загруженной обложки",
      },
    },
    {
      name: "cover",
      type: "upload",
      relationTo: "media",
      label: "Обложка (файл)",
    },
    {
      name: "imageAlt",
      type: "text",
      label: "Alt картинки",
      required: true,
    },
    {
      name: "sortOrder",
      type: "number",
      label: "Порядок",
      defaultValue: 0,
      admin: { position: "sidebar" },
    },
    {
      name: "season",
      type: "select",
      label: "Сезон",
      defaultValue: "atv",
      options: [
        { label: "Квадроциклы", value: "atv" },
        { label: "Снегоходы", value: "snow" },
        { label: "Всегда", value: "all" },
        { label: "Будущий / заготовка", value: "future" },
        { label: "Выкл (сапы/лошади…)", value: "off" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "activeForBooking",
      type: "checkbox",
      label: "Доступен для онлайн-брони",
      defaultValue: true,
      admin: {
        position: "sidebar",
        description: "Можно бронировать даже вне текущего сезона (будущий сезон).",
      },
    },
    {
      name: "published",
      type: "checkbox",
      label: "Опубликовано",
      defaultValue: true,
      admin: { position: "sidebar" },
    },
  ],
};
