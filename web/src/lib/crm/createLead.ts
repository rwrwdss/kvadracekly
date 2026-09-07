import type { Payload } from "payload";
import { normalizePhone } from "@/lib/phone";
import { assertSlotAvailable } from "@/lib/booking/availability";
import {
  formatBookingDate,
  parseBookingDateValue,
  resolveDurationMinutes,
  type BookingSlot,
  MAX_GUESTS,
  OCCUPYING_STATUSES,
} from "@/lib/booking/slots";
import { bookableError, clampCompletedThrough, NIGHT_QUEST_TITLE } from "@/lib/booking/progress";

export type CreateLeadInput = {
  name?: string;
  phone?: string;
  date?: string;
  route?: string;
  guests?: number | string;
  message?: string;
  source?: string;
  tariff?: string;
  productId?: string | number;
  pageUrl?: string;
  bookingKind?: "day" | "night";
  durationMinutes?: number | string;
  contactPrefer?: string;
  riderExperience?: "novice" | "experienced" | "regular" | string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
  };
};

export type CreateLeadResult =
  | { ok: true; id: number | string; customerId: number | string; duplicate?: boolean }
  | { ok: false; error: string; status: number };

const ANTISPAM_MS = 2 * 60 * 1000;

function detectNight(input: CreateLeadInput): boolean {
  if (input.bookingKind === "night") return true;
  const source = String(input.source || "").toLowerCase();
  if (source === "night_quest" || source.includes("night")) return true;
  const route = String(input.route || "").trim();
  return route === NIGHT_QUEST_TITLE || route.toLowerCase().includes("ночн");
}

export async function createLead(
  payload: Payload,
  input: CreateLeadInput,
): Promise<CreateLeadResult> {
  const name = input.name?.trim() || "";
  const phoneRaw = input.phone?.trim() || "";
  const phone = normalizePhone(phoneRaw);
  const routeTitle = input.route?.trim() || "";
  const guestsRaw = Number(input.guests);
  const guests =
    Number.isFinite(guestsRaw) && guestsRaw >= 1
      ? Math.min(MAX_GUESTS, Math.floor(guestsRaw))
      : 1;
  const isNight = detectNight(input);
  const contactPrefer = String(input.contactPrefer || "").trim();
  const riderExperienceRaw = String(input.riderExperience || "").trim();
  const riderExperience = (["novice", "experienced", "regular"].includes(riderExperienceRaw)
    ? riderExperienceRaw
    : "") as "" | "novice" | "experienced" | "regular";
  const riderExperienceLabel =
    riderExperience === "novice"
      ? "Новичок"
      : riderExperience === "experienced"
        ? "Уже катался"
        : riderExperience === "regular"
          ? "Постоянный гость Вольницы"
          : "";

  if (!name || name.length < 2) {
    return { ok: false, error: "Укажите имя (минимум 2 символа)", status: 400 };
  }
  if (!phone) {
    return {
      ok: false,
      error: "Укажите корректный телефон (+7… или 8…)",
      status: 400,
    };
  }

  const now = new Date();

  const recent = await payload.find({
    collection: "leads",
    where: {
      and: [
        { phone: { equals: phone } },
        {
          createdAt: {
            greater_than_equal: new Date(now.getTime() - ANTISPAM_MS).toISOString(),
          },
        },
      ],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });

  if (recent.docs[0]) {
    return {
      ok: false,
      error: "Заявка уже отправлена. Подождите пару минут перед следующей.",
      status: 429,
    };
  }

  const existing = await payload.find({
    collection: "customers",
    where: { phone: { equals: phone } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });

  let customerId: number | string;
  let completedThrough = 0;

  if (existing.docs[0]) {
    customerId = existing.docs[0].id;
    completedThrough = clampCompletedThrough(existing.docs[0].completedThrough);
    await payload.update({
      collection: "customers",
      id: customerId,
      data: {
        name,
        lastLeadAt: now.toISOString(),
      },
      overrideAccess: true,
    });
  } else {
    const customer = await payload.create({
      collection: "customers",
      data: {
        name,
        phone,
        completedThrough: 0,
        lastLeadAt: now.toISOString(),
      },
      overrideAccess: true,
    });
    customerId = customer.id;
  }

  const productId =
    input.productId !== undefined && input.productId !== ""
      ? Number(input.productId)
      : undefined;

  const messageParts = [
    input.message?.trim() || "",
    contactPrefer ? `Связь: ${contactPrefer}` : "",
    riderExperienceLabel ? `Опыт за рулём: ${riderExperienceLabel}` : "",
  ].filter(Boolean);
  const message = messageParts.join("\n");

  if (isNight) {
    const nightRoute = routeTitle || NIGHT_QUEST_TITLE;
    const lead = await payload.create({
      collection: "leads",
      data: {
        customer: customerId,
        name,
        phone,
        date: "Согласуем в переписке",
        route: nightRoute,
        guests,
        message,
        source: input.source?.trim() || "night_quest",
        tariff: input.tariff?.trim() || nightRoute,
        pageUrl: input.pageUrl?.trim() || "",
        status: "new",
        bookingKind: "night",
        contactPrefer: contactPrefer || undefined,
        ...(riderExperience ? { riderExperience } : {}),
        utm: input.utm || {},
        ...(Number.isFinite(productId) ? { product: productId } : {}),
      },
      overrideAccess: true,
    });

    await notifyLeadCreated(payload, {
      leadId: lead.id,
      name,
      phone,
      date: "Согласуем в переписке",
      route: nightRoute,
      guests,
      source: input.source?.trim() || "night_quest",
      message,
      bookingKind: "night",
    });

    return { ok: true, id: lead.id, customerId };
  }

  const parsed = parseBookingDateValue(input.date?.trim() || "");
  if (!parsed?.dateKey || !parsed.slot) {
    return {
      ok: false,
      error: "Выберите дату и время в календаре",
      status: 400,
    };
  }

  const durationMinutes = resolveDurationMinutes(
    routeTitle,
    input.durationMinutes !== undefined ? Number(input.durationMinutes) : null,
  );

  const slotCheck = await assertSlotAvailable(
    payload,
    parsed.dateKey,
    parsed.slot,
    durationMinutes,
  );
  if (!slotCheck.ok) {
    return { ok: false, error: slotCheck.error, status: 409 };
  }

  const dateDisplay = formatBookingDate(parsed.dateKey, parsed.slot);
  const timeSlot = parsed.slot as BookingSlot;

  const sameSlot = await payload.find({
    collection: "leads",
    where: {
      and: [
        { phone: { equals: phone } },
        { dateKey: { equals: parsed.dateKey } },
        { timeSlot: { equals: timeSlot } },
        { status: { in: [...OCCUPYING_STATUSES] } },
      ],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });

  if (sameSlot.docs[0]) {
    return {
      ok: false,
      error: "Вы уже записаны на это время. Выберите другой слот или дождитесь ответа менеджера.",
      status: 409,
    };
  }

  const locked = bookableError(routeTitle, completedThrough);
  if (locked) {
    return { ok: false, error: locked, status: 403 };
  }

  const lead = await payload.create({
    collection: "leads",
    data: {
      customer: customerId,
      name,
      phone,
      dateKey: parsed.dateKey,
      timeSlot,
      date: dateDisplay,
      route: routeTitle,
      guests,
      message,
      source: input.source?.trim() || "booking_modal",
      tariff: input.tariff?.trim() || "",
      pageUrl: input.pageUrl?.trim() || "",
      status: "new",
      bookingKind: "day",
      durationMinutes,
      contactPrefer: contactPrefer || undefined,
      ...(riderExperience ? { riderExperience } : {}),
      utm: input.utm || {},
      ...(Number.isFinite(productId) ? { product: productId } : {}),
    },
    overrideAccess: true,
  });

  await notifyLeadCreated(payload, {
    leadId: lead.id,
    name,
    phone,
    date: dateDisplay,
    route: routeTitle,
    guests,
    source: input.source?.trim() || "booking_modal",
    message,
    bookingKind: "day",
    durationMinutes,
  });

  return { ok: true, id: lead.id, customerId };
}

async function notifyLeadCreated(
  payload: Payload,
  data: {
    leadId: number | string;
    name: string;
    phone: string;
    date: string;
    route: string;
    guests: number;
    source: string;
    message: string;
    bookingKind?: string;
    durationMinutes?: number;
  },
) {
  const text = [
    data.bookingKind === "night" ? "🆕 Ночная заявка Вольница" : "🆕 Новая заявка Вольница",
    `Имя: ${data.name}`,
    `Телефон: ${data.phone}`,
    data.route ? `Маршрут: ${data.route}` : null,
    data.date ? `Дата: ${data.date}` : null,
    data.durationMinutes ? `Длительность: ~${data.durationMinutes} мин` : null,
    `Гостей: ${data.guests}`,
    `Источник: ${data.source}`,
    data.message ? `Комментарий: ${data.message}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const channel = (process.env.NOTIFY_CHANNEL || "log") as "telegram" | "email" | "log";
  let status: "sent" | "error" | "pending" = "pending";
  let error = "";

  try {
    if (channel === "telegram") {
      const token = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;
      if (!token || !chatId) throw new Error("TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID не заданы");

      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text }),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Telegram ${res.status}: ${body.slice(0, 200)}`);
      }
      status = "sent";
    } else if (channel === "email") {
      console.info("[NOTIFY:email]", text);
      if (!process.env.NOTIFY_EMAIL_TO) {
        throw new Error("NOTIFY_EMAIL_TO не задан — заявка в CRM, email не отправлен");
      }
      status = "sent";
    } else {
      console.info("[NOTIFY:log]", text);
      status = "sent";
    }
  } catch (err) {
    status = "error";
    error = err instanceof Error ? err.message : "notify failed";
    console.error("[NOTIFY]", error);
  }

  try {
    await payload.create({
      collection: "notifications",
      data: {
        type: "lead_created",
        channel,
        status,
        payload: text,
        error: error || undefined,
        lead: typeof data.leadId === "number" ? data.leadId : Number(data.leadId),
      },
      overrideAccess: true,
    });

    await payload.update({
      collection: "leads",
      id: data.leadId,
      data: {
        notifiedAt: status === "sent" ? new Date().toISOString() : undefined,
        notifyError: error || undefined,
      },
      overrideAccess: true,
    });
  } catch (err) {
    console.error("[NOTIFY:persist]", err);
  }
}
