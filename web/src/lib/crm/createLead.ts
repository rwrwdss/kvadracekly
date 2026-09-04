import type { Payload } from "payload";
import { normalizePhone } from "@/lib/phone";

export type CreateLeadInput = {
  name?: string;
  phone?: string;
  date?: string;
  route?: string;
  message?: string;
  source?: string;
  tariff?: string;
  productId?: string | number;
  pageUrl?: string;
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

export async function createLead(
  payload: Payload,
  input: CreateLeadInput,
): Promise<CreateLeadResult> {
  const name = input.name?.trim() || "";
  const phoneRaw = input.phone?.trim() || "";
  const phone = normalizePhone(phoneRaw);

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

  // Антиспам: та же телефонная заявка за последние 2 минуты
  const recent = await payload.find({
    collection: "leads",
    where: {
      and: [
        { phone: { equals: phone } },
        { createdAt: { greater_than_equal: new Date(now.getTime() - ANTISPAM_MS).toISOString() } },
      ],
    },
    limit: 1,
    depth: 0,
  });

  if (recent.docs[0]) {
    return {
      ok: true,
      id: recent.docs[0].id,
      customerId:
        typeof recent.docs[0].customer === "object" && recent.docs[0].customer
          ? recent.docs[0].customer.id
          : (recent.docs[0].customer as number | string) || 0,
      duplicate: true,
    };
  }

  const existing = await payload.find({
    collection: "customers",
    where: { phone: { equals: phone } },
    limit: 1,
    depth: 0,
  });

  let customerId: number | string;
  if (existing.docs[0]) {
    customerId = existing.docs[0].id;
    await payload.update({
      collection: "customers",
      id: customerId,
      data: {
        name,
        lastLeadAt: now.toISOString(),
      },
    });
  } else {
    const customer = await payload.create({
      collection: "customers",
      data: {
        name,
        phone,
        lastLeadAt: now.toISOString(),
      },
    });
    customerId = customer.id;
  }

  const productId =
    input.productId !== undefined && input.productId !== ""
      ? Number(input.productId)
      : undefined;

  const lead = await payload.create({
    collection: "leads",
    data: {
      customer: customerId,
      name,
      phone,
      date: input.date?.trim() || "",
      route: input.route?.trim() || "",
      message: input.message?.trim() || "",
      source: input.source?.trim() || "booking_modal",
      tariff: input.tariff?.trim() || "",
      pageUrl: input.pageUrl?.trim() || "",
      status: "new",
      utm: input.utm || {},
      ...(Number.isFinite(productId) ? { product: productId } : {}),
    },
  });

  await notifyLeadCreated(payload, {
    leadId: lead.id,
    name,
    phone,
    date: input.date?.trim() || "",
    route: input.route?.trim() || "",
    source: input.source?.trim() || "booking_modal",
    message: input.message?.trim() || "",
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
    source: string;
    message: string;
  },
) {
  const text = [
    "🆕 Новая заявка Вольница",
    `Имя: ${data.name}`,
    `Телефон: ${data.phone}`,
    data.route ? `Маршрут: ${data.route}` : null,
    data.date ? `Дата: ${data.date}` : null,
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
      // Базовый канал: логируем; SMTP/Resend можно подключить через env позже
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
    });

    await payload.update({
      collection: "leads",
      id: data.leadId,
      data: {
        notifiedAt: status === "sent" ? new Date().toISOString() : undefined,
        notifyError: error || undefined,
      },
    });
  } catch (err) {
    console.error("[NOTIFY:persist]", err);
  }
}
