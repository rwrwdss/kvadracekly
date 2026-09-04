import type { CollectionConfig } from "payload";

export const Notifications: CollectionConfig = {
  slug: "notifications",
  labels: { singular: "Уведомление", plural: "Уведомления" },
  admin: {
    useAsTitle: "type",
    defaultColumns: ["type", "channel", "status", "createdAt"],
    group: "CRM",
  },
  access: {
    create: ({ req }) => Boolean(req.user),
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: "type",
      type: "select",
      label: "Тип",
      required: true,
      defaultValue: "lead_created",
      options: [{ label: "Новая заявка", value: "lead_created" }],
    },
    {
      name: "channel",
      type: "select",
      label: "Канал",
      required: true,
      options: [
        { label: "Telegram", value: "telegram" },
        { label: "Email", value: "email" },
        { label: "Лог (dev)", value: "log" },
      ],
    },
    {
      name: "status",
      type: "select",
      label: "Статус",
      required: true,
      defaultValue: "pending",
      options: [
        { label: "Ожидает", value: "pending" },
        { label: "Отправлено", value: "sent" },
        { label: "Ошибка", value: "error" },
      ],
    },
    {
      name: "payload",
      type: "textarea",
      label: "Текст / payload",
    },
    {
      name: "error",
      type: "text",
      label: "Ошибка",
    },
    {
      name: "lead",
      type: "relationship",
      relationTo: "leads",
      label: "Заявка",
    },
  ],
};
