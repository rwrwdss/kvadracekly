import type { CollectionConfig } from "payload";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/access/roles";

function revalidateFleet() {
  try {
    revalidatePath("/tehnika");
  } catch {
    /* outside Next request context (migrate/seed) */
  }
}

export const Fleet: CollectionConfig = {
  slug: "fleet",
  labels: { singular: "Единица техники", plural: "Техника" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["imageUrl", "name", "role", "season", "color", "count", "published", "sortOrder"],
    group: "Сайт",
    description: "Карточки на странице /tehnika. Порядок — по полю «Порядок».",
    components: {
      beforeListTable: ["./admin/components/CatalogLayoutPanel#FleetLayoutPanel"],
    },
  },
  access: {
    read: () => true,
    create: ({ req }) => isAdmin(req.user),
    update: ({ req }) => isAdmin(req.user),
    delete: ({ req }) => isAdmin(req.user),
  },
  hooks: {
    afterChange: [() => revalidateFleet()],
    afterDelete: [() => revalidateFleet()],
  },
  fields: [
    {
      name: "name",
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
      admin: { description: "Уникальный ключ, например kapitan" },
    },
    {
      name: "role",
      type: "text",
      label: "Роль",
      required: true,
      admin: { description: "Грязь / прогулочный / …" },
    },
    {
      name: "color",
      type: "text",
      label: "Цвет",
      required: true,
    },
    {
      name: "count",
      type: "number",
      label: "Количество",
      required: true,
      min: 1,
      defaultValue: 1,
    },
    {
      name: "seats",
      type: "number",
      label: "Мест",
      required: true,
      min: 1,
      defaultValue: 2,
    },
    {
      name: "drive",
      type: "text",
      label: "Привод",
      required: true,
      defaultValue: "4×4",
    },
    {
      name: "imageUrl",
      type: "text",
      label: "Картинка (путь)",
      admin: {
        description: "Например /images/fleet/....jpg — если нет загруженной обложки",
        components: {
          Cell: "./admin/components/PathImageCell#PathImageCell",
        },
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
      admin: { position: "sidebar" },
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
