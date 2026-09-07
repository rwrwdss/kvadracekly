import type { CollectionConfig } from "payload";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/access/roles";
import { seoFields } from "@/cms/fields/seoUtm";

function revalidateGallery() {
  try {
    revalidatePath("/galereya");
    revalidatePath("/");
  } catch {
    /* outside Next */
  }
}

/** Живые фото галереи — загружаются через CMS (импорт файла в поле «Фото»). */
export const Gallery: CollectionConfig = {
  slug: "gallery",
  labels: { singular: "Фото галереи", plural: "Галерея" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "category", "published", "sortOrder", "updatedAt"],
    group: "Главная",
    description:
      "Карусель и страница /galereya. Создайте запись → загрузите фото (импорт файла) → «Опубликовано».",
    components: {
      beforeListTable: ["./admin/components/HomeLayoutPanel#GalleryHomePanel"],
    },
  },
  access: {
    read: () => true,
    create: ({ req }) => isAdmin(req.user),
    update: ({ req }) => isAdmin(req.user),
    delete: ({ req }) => isAdmin(req.user),
  },
  hooks: {
    afterChange: [() => revalidateGallery()],
    afterDelete: [() => revalidateGallery()],
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
      admin: {
        description: "Загрузите файл с компьютера (Create New) или выберите из медиатеки.",
      },
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
      admin: { position: "sidebar" },
    },
    {
      name: "sortOrder",
      type: "number",
      label: "Порядок в карусели",
      defaultValue: 0,
      admin: {
        position: "sidebar",
        description: "Меньше число — раньше в карусели и на /galereya.",
      },
    },
    seoFields,
  ],
};
