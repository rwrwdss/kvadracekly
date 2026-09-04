import type { CollectionConfig } from "payload";

export const Leads: CollectionConfig = {
  slug: "leads",
  labels: { singular: "Заявка", plural: "Заявки" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "phone", "route", "source", "status", "createdAt"],
    group: "CRM / Каталог",
  },
  access: {
    create: () => true,
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: "name", type: "text", label: "Имя", required: true },
    { name: "phone", type: "text", label: "Телефон", required: true },
    { name: "date", type: "text", label: "Желаемая дата" },
    { name: "route", type: "text", label: "Маршрут / товар" },
    { name: "tariff", type: "text", label: "Тариф" },
    { name: "message", type: "textarea", label: "Комментарий" },
    { name: "source", type: "text", label: "Источник" },
    {
      name: "utm",
      type: "group",
      label: "UTM с заявки",
      fields: [
        { name: "source", type: "text", label: "utm_source" },
        { name: "medium", type: "text", label: "utm_medium" },
        { name: "campaign", type: "text", label: "utm_campaign" },
        { name: "content", type: "text", label: "utm_content" },
        { name: "term", type: "text", label: "utm_term" },
      ],
    },
    {
      name: "status",
      type: "select",
      label: "Статус",
      defaultValue: "new",
      options: [
        { label: "Новая", value: "new" },
        { label: "В работе", value: "in_progress" },
        { label: "Подтверждена", value: "confirmed" },
        { label: "Закрыта", value: "done" },
        { label: "Отмена", value: "cancelled" },
        { label: "Спам", value: "spam" },
      ],
    },
    {
      name: "product",
      type: "relationship",
      relationTo: "products",
      label: "Товар",
    },
  ],
};
