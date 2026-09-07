import type { GlobalConfig } from "payload";
import { hideFromManager, isAdmin } from "@/access/roles";
import { BOOKING_SLOTS, SLOT_CAPACITY } from "@/lib/booking/slots";

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
      name: "booking",
      type: "group",
      label: "Календарь записи (очередь)",
      admin: {
        description:
          "Управляет умным календарём на сайте (кнопка «Забронировать» в шапке). Заявки — в разделе CRM → Заявки.",
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
            description:
              "Удобнее править в разделе Календарь → Остановка. Период включительно: запись возможна до и после него.",
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
            description: "Отдельные дни. Периоды — в «Остановки календаря» или в разделе Календарь.",
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
          "Квадро → пауза → снегоходы. В паузу сайт живёт: можно бронировать будущий сезон. Локальные стопы — в Календаре.",
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
          label: "Подпись на сайте",
          defaultValue: "Сезон квадроциклов",
          admin: { description: "Короткий ярлык, например «Сезон снегоходов»." },
        },
        {
          name: "bannerText",
          type: "textarea",
          label: "Текст баннера",
          defaultValue:
            "Сейчас сезон квадроциклов. Можно оставить заявку на ближайшие даты.",
          admin: {
            description: "Показывается под шапкой (не в герое). В паузу — про бронь на будущий сезон.",
          },
        },
      ],
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
