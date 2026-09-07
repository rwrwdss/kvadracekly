import type { CollectionConfig } from "payload";
import { isAdmin, isStaff } from "@/access/roles";

export const Notifications: CollectionConfig = {
  slug: "notifications",
  labels: { singular: "Уведомление", plural: "Уведомления" },
  admin: {
    hidden: true,
    useAsTitle: "type",
    defaultColumns: ["type", "channel", "status", "createdAt"],
    group: "CRM",
    description: "История сообщений о новых заявках. Скрыто, пока Telegram/почта не подключены.",
  },
  access: {
    create: ({ req }) => isStaff(req.user),
    read: ({ req }) => isStaff(req.user),
    update: ({ req }) => isAdmin(req.user),
    delete: ({ req }) => isAdmin(req.user),
  },
  fields: [
    {
      name: "type",
      type: "select",
      label: "Тип",
      required: true,
      defaultValue: "lead_created",
      options: [{ label: "Новая заявка", value: "lead_created" }],
      admin: { readOnly: true },
    },
    {
      name: "channel",
      type: "select",
      label: "Канал",
      required: true,
      options: [
        { label: "Telegram", value: "telegram" },
        { label: "Email", value: "email" },
        { label: "Журнал", value: "log" },
      ],
      admin: { readOnly: true },
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
      admin: { readOnly: true },
    },
    {
      name: "payload",
      type: "textarea",
      label: "Текст сообщения",
      admin: { readOnly: true },
    },
    {
      name: "error",
      type: "text",
      label: "Ошибка",
      admin: {
        condition: (_, siblingData) => Boolean(siblingData?.error),
        readOnly: true,
      },
    },
    {
      name: "lead",
      type: "relationship",
      relationTo: "leads",
      label: "Заявка",
      admin: { readOnly: true },
    },
  ],
};
