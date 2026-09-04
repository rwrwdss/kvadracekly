import type { CollectionConfig } from "payload";
import { hideFromManager, isAdmin } from "@/access/roles";
import { seoFields, utmFields } from "@/cms/fields/seoUtm";

/** Живые фото галереи — только загруженные через CMS */
export const Gallery: CollectionConfig = {
  slug: "gallery",
  labels: { singular: "Фото галереи", plural: "Галерея" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "published", "updatedAt"],
    group: "Контент",
    description: "На сайте показываются только опубликованные живые фото из этой коллекции.",
    hidden: ({ user }) => hideFromManager(user),
  },
  access: {
    read: () => true,
    create: ({ req }) => isAdmin(req.user),
    update: ({ req }) => isAdmin(req.user),
    delete: ({ req }) => isAdmin(req.user),
  },
  fields: [
    {
      name: "title",
      type: "text",
      label: "Заголовок",
      required: true,
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      label: "Фото",
      required: true,
    },
    {
      name: "category",
      type: "select",
      label: "Категория",
      required: true,
      defaultValue: "atv",
      options: [
        { label: "Квадроциклы", value: "atv" },
        { label: "Маршруты", value: "routes" },
        { label: "Природа", value: "nature" },
        { label: "Ночные", value: "night" },
        { label: "Усадьба", value: "manor" },
      ],
    },
    {
      name: "published",
      type: "checkbox",
      label: "Опубликовано на сайте",
      defaultValue: true,
    },
    {
      name: "sortOrder",
      type: "number",
      label: "Порядок",
      defaultValue: 0,
    },
    seoFields,
  ],
};
