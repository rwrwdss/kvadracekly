import type { GlobalConfig } from "payload";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Настройки сайта",
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "siteName",
      type: "text",
      label: "Название сайта",
      defaultValue: "Вольница",
    },
    {
      name: "tagline",
      type: "text",
      label: "Слоган",
      defaultValue: "Территория свободы",
    },
    {
      name: "defaultSeo",
      type: "group",
      label: "SEO по умолчанию",
      fields: [
        { name: "metaTitle", type: "text", label: "Meta Title" },
        { name: "metaDescription", type: "textarea", label: "Meta Description" },
        { name: "metaKeywords", type: "text", label: "Keywords" },
        {
          name: "ogImage",
          type: "upload",
          relationTo: "media",
          label: "OG Image",
        },
      ],
    },
    {
      name: "galleryIntro",
      type: "group",
      label: "Страница галереи",
      fields: [
        { name: "title", type: "text", label: "H1", defaultValue: "Галерея" },
        {
          name: "subtitle",
          type: "text",
          label: "Подзаголовок",
          defaultValue: "Атмосфера свободы и приключений",
        },
        {
          name: "description",
          type: "textarea",
          label: "Описание",
          defaultValue:
            "Живые кадры с маршрутов Вольницы. Фото загружаются администратором в CMS.",
        },
      ],
    },
    {
      name: "notify",
      type: "group",
      label: "Уведомления о заявках",
      fields: [
        {
          name: "channelHint",
          type: "text",
          label: "Канал (через env)",
          admin: {
            readOnly: true,
            description:
              "NOTIFY_CHANNEL=log|telegram|email · TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID или NOTIFY_EMAIL_TO",
          },
          defaultValue: "Смотрите переменные окружения Vercel / .env",
        },
      ],
    },
  ],
};
