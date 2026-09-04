import type { CollectionConfig } from "payload";

export const Media: CollectionConfig = {
  slug: "media",
  labels: { singular: "Файл", plural: "Медиатека" },
  access: {
    read: () => true,
  },
  admin: {
    group: "Контент",
  },
  upload: {
    staticDir: "media",
    mimeTypes: ["image/*"],
    imageSizes: [
      { name: "thumb", width: 400, height: 300, position: "centre" },
      { name: "card", width: 900, height: 600, position: "centre" },
      { name: "hero", width: 1920, height: 1080, position: "centre" },
    ],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      label: "Alt-текст",
      required: true,
    },
  ],
};
