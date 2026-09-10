import type { CollectionConfig } from "payload";
import { isAdmin, isStaff } from "@/access/roles";

export const Customers: CollectionConfig = {
  slug: "customers",
  labels: { singular: "Клиент", plural: "Клиенты" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "phone", "completedThrough", "lastLeadAt"],
    group: "CRM",
    description: "Карточка гостя и прогресс маршрутов для записи.",
    listSearchableFields: ["name", "phone"],
    components: {
      beforeListTable: ["./admin/components/CustomersBoard#CustomersBoard"],
    },
  },
  access: {
    // Клиенты создаются при заявке (createLead / CRM «Новая заявка»).
    create: () => false,
    read: ({ req }) => isStaff(req.user),
    update: ({ req }) => isAdmin(req.user),
    delete: ({ req }) => isAdmin(req.user),
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
    {
      name: "completedThrough",
      type: "number",
      label: "Пройдено уровней",
      defaultValue: 0,
      min: 0,
      max: 5,
      admin: {
        step: 1,
        description:
          "0 — новичок · 1 — озеро → Памятник · 2 → Родник · 3 → Экспедиция · 4 → Лесные тропы · 5 — всё пройдено.",
      },
    },
    { name: "notes", type: "textarea", label: "Заметки" },
    {
      name: "lastLeadAt",
      type: "date",
      label: "Последняя заявка",
      admin: { date: { pickerAppearance: "dayAndTime" }, readOnly: true },
    },
  ],
};
