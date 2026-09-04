import type { CollectionConfig } from "payload";
import { isAdmin } from "@/access/roles";

export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "Админ", plural: "Админы" },
  auth: true,
  admin: {
    useAsTitle: "email",
    group: "Система",
    hidden: ({ user }) => !isAdmin(user),
    description: "Доступ только у администраторов. Менеджеры работают в разделе CRM.",
  },
  access: {
    admin: ({ req: { user } }) => Boolean(user),
    // Нужно staff: иначе depth=1 не показывает имя ответственного на заявке
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => isAdmin(user),
    update: ({ req: { user } }) => {
      if (isAdmin(user)) return true;
      if (user) return { id: { equals: user.id } };
      return false;
    },
    delete: ({ req: { user } }) => isAdmin(user),
  },
  fields: [
    {
      name: "name",
      type: "text",
      label: "Имя",
    },
    {
      name: "role",
      type: "select",
      label: "Роль",
      required: true,
      defaultValue: "manager",
      options: [
        { label: "Администратор", value: "admin" },
        { label: "Менеджер CRM", value: "manager" },
      ],
      access: {
        update: ({ req: { user } }) => isAdmin(user),
      },
      admin: {
        description: "Менеджер видит только заявки, клиентов и уведомления.",
      },
    },
  ],
};
