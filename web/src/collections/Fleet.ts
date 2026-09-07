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
    defaultColumns: ["name", "role", "published"],
    listSearchableFields: ["name", "role"],
    group: "Сайт",
    description: "Тексты страницы сверху, карточки техники ниже.",
    components: {
      beforeListTable: [
        "./admin/components/CatalogLayoutPanel#FleetLayoutPanel",
        "./admin/components/CatalogItemsBoard#FleetItemsBoard",
      ],
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
      type: "tabs",
      tabs: [
        {
          label: "Что видит гость",
          description: "Карточка техники на странице /tehnika",
          fields: [
            {
              name: "name",
              type: "text",
              label: "Название",
              required: true,
              admin: { description: "Например: Капитан" },
            },
            {
              name: "role",
              type: "text",
              label: "Роль / назначение",
              required: true,
              admin: { description: "Грязь / прогулочный / …" },
            },
            {
              type: "row",
              fields: [
                {
                  name: "color",
                  type: "text",
                  label: "Цвет",
                  required: true,
                  admin: { width: "50%" },
                },
                {
                  name: "drive",
                  type: "text",
                  label: "Привод",
                  required: true,
                  defaultValue: "4×4",
                  admin: { width: "50%" },
                },
              ],
            },
            {
              type: "row",
              fields: [
                {
                  name: "count",
                  type: "number",
                  label: "Сколько штук",
                  required: true,
                  min: 1,
                  defaultValue: 1,
                  admin: { width: "50%" },
                },
                {
                  name: "seats",
                  type: "number",
                  label: "Мест",
                  required: true,
                  min: 1,
                  defaultValue: 2,
                  admin: { width: "50%" },
                },
              ],
            },
          ],
        },
        {
          label: "Фото",
          fields: [
            {
              name: "imageUrl",
              type: "text",
              label: "Путь к картинке",
              admin: {
                description: "Например /images/fleet/....jpg",
                components: {
                  Field: "./admin/components/ImagePathField#ImagePathField",
                },
              },
            },
            {
              name: "cover",
              type: "upload",
              relationTo: "media",
              label: "Или загрузить файл",
            },
            {
              name: "imageAlt",
              type: "text",
              label: "Описание картинки (для слабовидящих)",
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: "slug",
      type: "text",
      label: "Технический код (slug)",
      required: true,
      unique: true,
      admin: {
        position: "sidebar",
        description: "Не меняйте без нужды. Например: kapitan",
      },
    },
    {
      name: "sortOrder",
      type: "number",
      label: "Порядок на сайте",
      defaultValue: 0,
      admin: { position: "sidebar", description: "Меньше число — выше в списке" },
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
        { label: "Выкл", value: "off" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "activeForBooking",
      type: "checkbox",
      label: "Можно бронировать онлайн",
      defaultValue: true,
      admin: { position: "sidebar" },
    },
    {
      name: "published",
      type: "checkbox",
      label: "Показывать на сайте",
      defaultValue: true,
      admin: { position: "sidebar" },
    },
  ],
};
