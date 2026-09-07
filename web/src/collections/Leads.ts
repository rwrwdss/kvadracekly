import type { CollectionConfig } from "payload";
import { isAdmin, isStaff } from "@/access/roles";
import { BOOKING_SLOTS, formatBookingDate, parseBookingDateValue } from "@/lib/booking/slots";
import { clampCompletedThrough, findRouteByTitle } from "@/lib/booking/progress";

const SLOT_OPTIONS = BOOKING_SLOTS.map((s) => ({ label: s, value: s }));

function adminOnlyField() {
  return {
    condition: (_: unknown, __: unknown, { user }: { user?: unknown }) => isAdmin(user as never),
  };
}

async function bumpCustomerProgress(args: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  req: any;
  customerId: number | string | null | undefined;
  routeTitle: string | null | undefined;
  status: string | null | undefined;
}) {
  if (args.status !== "done") return;
  const route = findRouteByTitle(String(args.routeTitle || ""));
  if (!route || !args.customerId) return;

  const customer = await args.req.payload.findByID({
    collection: "customers",
    id: args.customerId,
    depth: 0,
    overrideAccess: true,
  });
  if (!customer) return;

  const current = clampCompletedThrough(customer.completedThrough);
  if (route.progressOrder <= current) return;

  await args.req.payload.update({
    collection: "customers",
    id: args.customerId,
    data: { completedThrough: route.progressOrder },
    overrideAccess: true,
  });
}

export const Leads: CollectionConfig = {
  slug: "leads",
  labels: { singular: "Заявка", plural: "Заявки" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "phone", "bookingKind", "dateKey", "timeSlot", "assignee", "status", "createdAt"],
    group: "CRM",
    description: "Очередь записей. Статус «Закрыта» открывает клиенту следующий маршрут. Ночные — без слота.",
    listSearchableFields: ["name", "phone", "route"],
    components: {
      beforeListTable: ["./admin/components/LeadsBoard#LeadsBoard"],
    },
  },
  access: {
    // Публичные заявки только через /api/booking → createLead (overrideAccess).
    create: ({ req }) => isAdmin(req.user),
    read: ({ req }) => isStaff(req.user),
    update: ({ req }) => isAdmin(req.user),
    delete: ({ req }) => isAdmin(req.user),
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (!data) return data;

        if (data.bookingKind === "night") {
          if (!data.date) data.date = "Согласуем в переписке";
          return data;
        }

        if (data.dateKey && data.timeSlot) {
          data.date = formatBookingDate(String(data.dateKey), String(data.timeSlot));
          return data;
        }

        if (typeof data.date === "string" && data.date.trim()) {
          const parsed = parseBookingDateValue(data.date);
          if (parsed) {
            data.dateKey = parsed.dateKey;
            if (parsed.slot) data.timeSlot = parsed.slot;
            if (parsed.slot) data.date = formatBookingDate(parsed.dateKey, parsed.slot);
          }
        }

        return data;
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        const becameDone = doc.status === "done" && previousDoc?.status !== "done";
        if (!becameDone) return;

        const customerId =
          typeof doc.customer === "object" && doc.customer
            ? doc.customer.id
            : doc.customer;

        await bumpCustomerProgress({
          req,
          customerId,
          routeTitle: doc.route,
          status: doc.status,
        });
      },
    ],
  },
  fields: [
    {
      name: "customer",
      type: "relationship",
      relationTo: "customers",
      label: "Клиент",
      admin: { position: "sidebar" },
    },
    {
      name: "assignee",
      type: "relationship",
      relationTo: "users",
      label: "Ответственный",
      admin: {
        position: "sidebar",
        description: "Менеджер, который взял заявку себе.",
      },
    },
    { name: "name", type: "text", label: "Имя", required: true },
    { name: "phone", type: "text", label: "Телефон", required: true, index: true },
    {
      name: "bookingKind",
      type: "select",
      label: "Тип записи",
      defaultValue: "day",
      index: true,
      options: [
        { label: "Дневная", value: "day" },
        { label: "Ночная заявка", value: "night" },
      ],
      admin: {
        position: "sidebar",
        description: "Ночная — без календарного слота, дату согласуют в переписке.",
      },
    },
    {
      type: "row",
      fields: [
        {
          name: "dateKey",
          type: "text",
          label: "Дата",
          index: true,
          admin: {
            width: "33%",
            placeholder: "2026-09-15",
            description: "Для ночных может быть пусто.",
          },
        },
        {
          name: "timeSlot",
          type: "select",
          label: "Время старта",
          index: true,
          options: SLOT_OPTIONS,
          admin: { width: "33%" },
        },
        {
          name: "durationMinutes",
          type: "number",
          label: "Длительность, мин",
          min: 30,
          max: 480,
          admin: {
            width: "34%",
            description: "Для дневных: 60 / 90 / 120 / 180.",
          },
        },
      ],
    },
    {
      name: "contactPrefer",
      type: "text",
      label: "Как связаться",
      admin: {
        description: "WhatsApp / Telegram / звонок — для ночных заявок.",
      },
    },
    {
      name: "date",
      type: "text",
      label: "Дата и время",
      admin: {
        readOnly: true,
        ...adminOnlyField(),
      },
    },
    {
      name: "guests",
      type: "number",
      label: "Гостей",
      defaultValue: 1,
      min: 1,
      max: 20,
    },
    { name: "route", type: "text", label: "Маршрут" },
    { name: "tariff", type: "text", label: "Тариф" },
    {
      name: "riderExperience",
      type: "select",
      label: "Опыт за рулём",
      options: [
        { label: "Новичок", value: "novice" },
        { label: "Уже катался", value: "experienced" },
        { label: "Постоянный гость Вольницы", value: "regular" },
      ],
      admin: {
        description: "Гость указывает при записи — чтобы не ставить опытного на «Зелёное озеро».",
      },
    },
    { name: "message", type: "textarea", label: "Комментарий" },
    {
      name: "source",
      type: "text",
      label: "Источник",
      index: true,
      admin: adminOnlyField(),
    },
    {
      name: "pageUrl",
      type: "text",
      label: "Страница",
      admin: adminOnlyField(),
    },
    {
      name: "utm",
      type: "group",
      label: "UTM",
      admin: adminOnlyField(),
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
      admin: {
        position: "sidebar",
        description: "«Закрыта» — заезд состоялся, клиенту открывается следующий маршрут.",
        components: {
          Cell: "./admin/components/LeadStatusCell#LeadStatusCell",
        },
      },
    },
    {
      name: "product",
      type: "relationship",
      relationTo: "products",
      label: "Товар",
      admin: adminOnlyField(),
    },
    {
      name: "notifiedAt",
      type: "date",
      label: "Уведомление",
      admin: {
        date: { pickerAppearance: "dayAndTime" },
        position: "sidebar",
        ...adminOnlyField(),
      },
    },
    {
      name: "notifyError",
      type: "text",
      label: "Ошибка уведомления",
      admin: {
        position: "sidebar",
        ...adminOnlyField(),
      },
    },
  ],
};
