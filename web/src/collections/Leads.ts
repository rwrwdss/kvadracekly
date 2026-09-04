import type { CollectionConfig } from "payload";

export const Leads: CollectionConfig = {
  slug: "leads",
  labels: { singular: "Заявка", plural: "Заявки" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "phone", "route", "source", "status", "createdAt"],
    group: "CRM",
  },
  access: {
    create: () => true,
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: "customer",
      type: "relationship",
      relationTo: "customers",
      label: "Клиент",
      admin: { position: "sidebar" },
    },
    { name: "name", type: "text", label: "Имя", required: true },
    { name: "phone", type: "text", label: "Телефон", required: true, index: true },
    { name: "date", type: "text", label: "Желаемая дата" },
    { name: "route", type: "text", label: "Маршрут" },
    { name: "tariff", type: "text", label: "Тариф" },
    { name: "message", type: "textarea", label: "Комментарий" },
    { name: "source", type: "text", label: "Источник", index: true },
    { name: "pageUrl", type: "text", label: "Страница" },
    {
      name: "utm",
      type: "group",
      label: "UTM",
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
      index: true,
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
    {
      name: "notifiedAt",
      type: "date",
      label: "Уведомление отправлено",
      admin: { date: { pickerAppearance: "dayAndTime" }, position: "sidebar" },
    },
    {
      name: "notifyError",
      type: "text",
      label: "Ошибка уведомления",
      admin: { position: "sidebar" },
    },
  ],
};
