import type { GlobalConfig } from "payload";
import { revalidatePath } from "next/cache";
import { hideFromManager, isAdmin } from "@/access/roles";
import { BOOKING_SLOTS, SLOT_CAPACITY } from "@/lib/booking/slots";
import {
  catalogPageLayoutFields,
  DEFAULT_PAGE_FLEET,
  DEFAULT_PAGE_TARIFFS,
} from "@/lib/cms/catalogPageDefaults";

function revalidateSitePages() {
  try {
    revalidatePath("/");
    revalidatePath("/tarify");
    revalidatePath("/tehnika");
  } catch {
    /* outside Next request */
  }
}

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Настройки сайта",
  admin: {
    hidden: ({ user }) => hideFromManager(user),
  },
  access: {
    read: () => true,
    update: ({ req }) => isAdmin(req.user),
  },
  hooks: {
    afterChange: [() => revalidateSitePages()],
  },
  fields: [
    {
      name: "siteName",
      type: "text",
      label: "Название сайта",
      defaultValue: "Вольница",
      admin: { hidden: true },
    },
    {
      name: "tagline",
      type: "text",
      label: "Слоган",
      defaultValue: "Территория свободы",
      admin: { hidden: true },
    },
    {
      name: "booking",
      type: "group",
      label: "Календарь записи (очередь)",
      admin: {
        description:
          "Включение календаря и вместимость слота. Остановки дней — в разделе Календарь → Остановка.",
      },
      fields: [
        {
          name: "enabled",
          type: "checkbox",
          label: "Календарь включён",
          defaultValue: true,
        },
        {
          name: "slotCapacity",
          type: "number",
          label: "Записей на один слот времени",
          defaultValue: SLOT_CAPACITY,
          min: 1,
          max: 10,
          admin: {
            description:
              "Сколько отдельных заявок можно принять на одно время (например 14:00). По умолчанию 3.",
          },
        },
        {
          name: "slotHint",
          type: "text",
          label: "Слоты на сайте",
          defaultValue: `${BOOKING_SLOTS.join(", ")} · занятость по длительности тарифа (до 22:00)`,
          admin: {
            readOnly: true,
            description:
              "Старты 10:00–20:00. Занятость — интервал [старт, старт+durationMinutes), capacity пересечений.",
          },
        },
        {
          name: "closedRanges",
          type: "array",
          label: "Остановки календаря (периоды)",
          labels: { singular: "Период", plural: "Периоды" },
          admin: {
            hidden: true,
            description: "Правится в Календарь → Остановка.",
          },
          fields: [
            {
              name: "from",
              type: "text",
              label: "С (ГГГГ-ММ-ДД)",
              required: true,
              admin: { placeholder: "2026-09-15" },
            },
            {
              name: "to",
              type: "text",
              label: "По (ГГГГ-ММ-ДД)",
              required: true,
              admin: { placeholder: "2026-09-20" },
            },
            {
              name: "note",
              type: "text",
              label: "Причина",
            },
          ],
        },
        {
          name: "closedDates",
          type: "array",
          label: "Закрытые дни (по одному)",
          labels: { singular: "День", plural: "Закрытые дни" },
          admin: {
            hidden: true,
            description: "Правится в Календарь → Остановка.",
          },
          fields: [
            {
              name: "date",
              type: "text",
              label: "Дата (ГГГГ-ММ-ДД)",
              required: true,
              admin: { placeholder: "2026-09-15" },
            },
            {
              name: "note",
              type: "text",
              label: "Причина (для себя)",
            },
          ],
        },
      ],
    },
    {
      name: "season",
      type: "group",
      label: "Сезон проката",
      admin: {
        description:
          "Переключение квадро / пауза / снегоходы. При смене обновите подпись, баннер и вёрстку страниц Тарифы/Техника (зимние тексты и фото).",
      },
      fields: [
        {
          name: "current",
          type: "select",
          label: "Текущий сезон",
          defaultValue: "atv",
          options: [
            { label: "Квадроциклы", value: "atv" },
            { label: "Снегоходы", value: "snow" },
            { label: "Пауза / пересменка", value: "pause" },
          ],
        },
        {
          name: "label",
          type: "text",
          label: "Подпись баннера на сайте",
          defaultValue: "Сезон квадроциклов",
          admin: {
            description: "Короткий ярлык под шапкой. Для зимы: «Сезон снегоходов».",
          },
        },
        {
          name: "bannerText",
          type: "textarea",
          label: "Текст баннера сезона",
          defaultValue:
            "Сейчас сезон квадроциклов. Можно оставить заявку на ближайшие даты.",
          admin: {
            description: "Полоса под шапкой (не герой). В паузу — про бронь на будущий сезон.",
          },
        },
      ],
    },
    {
      name: "pageTariffs",
      type: "group",
      label: "Страница «Тарифы» (/tarify)",
      admin: {
        description:
          "Вёрстка героя и нижнего CTA. Удобнее править также панелью над списком Тарифы.",
      },
      fields: catalogPageLayoutFields(DEFAULT_PAGE_TARIFFS),
    },
    {
      name: "pageFleet",
      type: "group",
      label: "Страница «Техника» (/tehnika)",
      admin: {
        description:
          "Вёрстка героя и нижнего CTA. Удобнее править также панелью над списком Техника.",
      },
      fields: catalogPageLayoutFields(DEFAULT_PAGE_FLEET),
    },
    {
      name: "defaultSeo",
      type: "group",
      label: "SEO по умолчанию",
      admin: { hidden: true },
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
      admin: { hidden: true },
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
      admin: {
        hidden: true,
        description: "Скрыто, пока Telegram/почта не подключены.",
      },
      fields: [
        {
          name: "channelHint",
          type: "text",
          label: "Канал уведомлений",
          admin: {
            readOnly: true,
            description: "Настраивается администратором на сервере.",
          },
          defaultValue: "Telegram / Email — через настройки сервера",
        },
      ],
    },
  ],
};
