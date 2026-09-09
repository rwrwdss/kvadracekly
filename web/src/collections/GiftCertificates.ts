import type { CollectionConfig } from "payload";
import { isAdmin, isStaff } from "@/access/roles";

/** Подарочные сертификаты — создаются из CRM, открываются по уникальной ссылке. */
export const GiftCertificates: CollectionConfig = {
  slug: "gift-certificates",
  labels: { singular: "Сертификат", plural: "Подарочные сертификаты" },
  admin: {
    useAsTitle: "fullName",
    defaultColumns: ["fullName", "routeTitle", "slug", "status", "createdAt"],
    group: "CRM",
    description: "Именные сертификаты с уникальной публичной ссылкой.",
    hidden: true,
    listSearchableFields: ["fullName", "firstName", "lastName", "slug", "routeTitle"],
  },
  access: {
    create: () => false,
    read: ({ req }) => isStaff(req.user),
    update: ({ req }) => isStaff(req.user),
    delete: ({ req }) => isAdmin(req.user),
  },
  fields: [
    {
      name: "firstName",
      type: "text",
      label: "Имя",
      required: true,
    },
    {
      name: "lastName",
      type: "text",
      label: "Фамилия",
      required: true,
    },
    {
      name: "fullName",
      type: "text",
      label: "ФИО",
      admin: { readOnly: true },
    },
    {
      name: "slug",
      type: "text",
      label: "Ссылка (slug)",
      required: true,
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        description: "Публичная страница: /sertifikat/{slug}",
      },
    },
    {
      name: "routeSlug",
      type: "text",
      label: "Slug маршрута",
      required: true,
    },
    {
      name: "routeTitle",
      type: "text",
      label: "Маршрут",
      required: true,
    },
    {
      name: "status",
      type: "select",
      label: "Статус",
      required: true,
      defaultValue: "active",
      options: [
        { label: "Активен", value: "active" },
        { label: "Использован", value: "redeemed" },
        { label: "Отменён", value: "cancelled" },
      ],
    },
    {
      name: "validUntil",
      type: "date",
      label: "Действует до",
      admin: { date: { pickerAppearance: "dayOnly" } },
    },
    {
      name: "createdBy",
      type: "relationship",
      relationTo: "users",
      label: "Создал",
      admin: { readOnly: true },
    },
    {
      name: "notes",
      type: "textarea",
      label: "Заметки",
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (!data) return data;
        const first = String(data.firstName || "").trim();
        const last = String(data.lastName || "").trim();
        if (first || last) {
          data.fullName = [first, last].filter(Boolean).join(" ");
        }
        return data;
      },
    ],
  },
};
