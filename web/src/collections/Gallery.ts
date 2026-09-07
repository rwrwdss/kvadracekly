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
  labels: { singular: "Фото", plural: "Фото для карусели" },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["image", "title", "category", "published", "sortOrder", "updatedAt"],
    group: "Главная",
    description:
      "Фото на главной (карусель) и на странице «Галерея». Нажмите «Create New» → загрузите файл → сохраните.",
    components: {
      beforeListTable: ["./admin/components/GalleryPhotosBoard#GalleryPhotosBoard"],
    },
  },
  defaultPopulate: {
    image: true,
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
      label: "Название фото (подпись)",
      required: true,
      admin: {
        description: "Короткая подпись под кадром, например: «У пруда на закате».",
      },
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      label: "Загрузить фото с компьютера",
      required: true,
      admin: {
        description:
          "Нажмите «Choose from existing» или создайте новый файл (Create New) и выберите картинку.",
        components: {
          Cell: "./admin/components/GalleryImageCell#GalleryImageCell",
        },
      },
    },
    {
      name: "category",
      type: "select",
      label: "Раздел / тема",
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
      label: "Показывать на сайте",
      defaultValue: true,
      admin: {
        position: "sidebar",
        description: "Снимите галочку, чтобы спрятать фото без удаления.",
      },
    },
    {
      name: "sortOrder",
      type: "number",
      label: "Порядок показа",
      defaultValue: 0,
      admin: {
        position: "sidebar",
        description: "Меньше число — фото раньше в карусели. Например: 1, 2, 3…",
      },
    },
    seoFields,
  ],
};
