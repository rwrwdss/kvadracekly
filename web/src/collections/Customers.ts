import type { CollectionConfig } from "payload";

export const Customers: CollectionConfig = {
  slug: "customers",
  labels: { singular: "Клиент", plural: "Клиенты" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "phone", "lastLeadAt", "updatedAt"],
    group: "CRM",
  },
  access: {
    create: () => true,
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: "name", type: "text", label: "Имя", required: true },
    {
      name: "phone",
      type: "text",
      label: "Телефон",
      required: true,
      unique: true,
      index: true,
    },
    { name: "email", type: "email", label: "Email" },
    { name: "notes", type: "textarea", label: "Заметки менеджера" },
    {
      name: "lastLeadAt",
      type: "date",
      label: "Последняя заявка",
      admin: { date: { pickerAppearance: "dayAndTime" } },
    },
  ],
};
