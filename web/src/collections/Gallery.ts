import type { CollectionConfig } from "payload";
import { revalidatePath } from "next/cache";

function revalidateGallery() {
  try {
    revalidatePath("/galereya");
    revalidatePath("/");
  } catch {
    /* outside Next */
  }
}

/**
 * Данные галереи для публичного сайта остаются.
 * В админ-панели раздел полностью недоступен.
 */
export const Gallery: CollectionConfig = {
  slug: "gallery",
  labels: { singular: "Фото", plural: "Фото для карусели" },
  admin: {
    useAsTitle: "title",
    hidden: true,
    hideAPIURL: true,
    description: "Раздел отключён в админке.",
    components: {
      views: {
        list: {
          Component: "./admin/components/GalleryAdminGone#GalleryAdminGone",
        },
        edit: {
          root: {
            Component: "./admin/components/GalleryAdminGone#GalleryAdminGone",
          },
        },
      },
    },
  },
  defaultPopulate: {
    image: true,
  },
  access: {
    // Не показывать коллекцию в админке никому
    admin: () => false,
    read: () => true,
    create: () => false,
    update: () => false,
    delete: () => false,
  },
  hooks: {
    afterChange: [() => revalidateGallery()],
    afterDelete: [() => revalidateGallery()],
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: true,
    },
    {
      name: "category",
      type: "select",
      required: true,
      defaultValue: "atv",
      options: [
        { label: "Квадроциклы", value: "atv" },
        { label: "Маршруты", value: "routes" },
        { label: "Природа", value: "nature" },
        { label: "Ночные выезды", value: "night" },
        { label: "Усадьба", value: "manor" },
      ],
    },
    {
      name: "published",
      type: "checkbox",
      defaultValue: true,
    },
    {
      name: "sortOrder",
      type: "number",
      defaultValue: 0,
    },
  ],
};
