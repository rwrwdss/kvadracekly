import type { Payload } from "payload";
import {
  BOOKING_SLOTS,
  OCCUPYING_STATUSES,
  SLOT_CAPACITY,
  expandDateRange,
  formatBookingDate,
  isSlotInPast,
  moscowTodayKey,
  parseBookingDateValue,
  toDateKey,
  type BookingSlot,
} from "@/lib/booking/slots";

export type BookingSettings = {
  enabled: boolean;
  slotCapacity: number;
  closedDates: Set<string>;
};

export type ClosedRange = {
  id?: string | null;
  from: string;
  to: string;
  note?: string | null;
};

export type DayAvailability = {
  date: string;
  closed: boolean;
  slots: Record<string, { count: number; capacity: number; full: boolean }>;
  total: number;
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export { expandDateRange };

export async function getBookingSettings(payload: Payload): Promise<BookingSettings> {
  try {
    const settings = await payload.findGlobal({
      slug: "site-settings",
      depth: 0,
    });
    const booking = (settings as {
      booking?: {
        enabled?: boolean | null;
        slotCapacity?: number | null;
        closedDates?: { date?: string | null }[] | null;
        closedRanges?: { from?: string | null; to?: string | null }[] | null;
      };
    }).booking;

    const closed = new Set<string>();
    for (const row of booking?.closedDates || []) {
      const key = String(row?.date || "").trim();
      if (DATE_RE.test(key)) closed.add(key);
    }
    for (const row of booking?.closedRanges || []) {
      const from = String(row?.from || "").trim();
      const to = String(row?.to || "").trim();
      for (const key of expandDateRange(from, to)) closed.add(key);
    }

    const capacity = Number(booking?.slotCapacity);
    return {
      enabled: booking?.enabled !== false,
      slotCapacity: Number.isFinite(capacity) && capacity >= 1 ? Math.floor(capacity) : SLOT_CAPACITY,
      closedDates: closed,
    };
  } catch {
    return {
      enabled: true,
      slotCapacity: SLOT_CAPACITY,
      closedDates: new Set(),
    };
  }
}

function emptyDay(dateKey: string, capacity: number, closed: boolean): DayAvailability {
  return {
    date: dateKey,
    closed,
    slots: Object.fromEntries(
      BOOKING_SLOTS.map((s) => [s, { count: 0, capacity, full: closed }]),
    ),
    total: 0,
  };
}

export async function buildMonthAvailability(
  payload: Payload,
  year: number,
  monthIndex: number,
): Promise<{
  settings: BookingSettings;
  days: Record<string, DayAvailability>;
  fromKey: string;
  toKey: string;
}> {
  const settings = await getBookingSettings(payload);
  const from = new Date(year, monthIndex, 1);
  const to = new Date(year, monthIndex + 1, 0);
  const fromKey = toDateKey(from);
  const toKey = toDateKey(to);

  const days: Record<string, DayAvailability> = {};
  for (let day = 1; day <= to.getDate(); day++) {
    const key = toDateKey(new Date(year, monthIndex, day));
    days[key] = emptyDay(key, settings.slotCapacity, settings.closedDates.has(key));
  }

  const result = await payload.find({
    collection: "leads",
    depth: 0,
    limit: 500,
    where: {
      and: [
        { status: { in: [...OCCUPYING_STATUSES] } },
      ],
    },
  });

  for (const lead of result.docs) {
    const dateKey =
      (typeof lead.dateKey === "string" && lead.dateKey) ||
      parseBookingDateValue(typeof lead.date === "string" ? lead.date : "")?.dateKey ||
      "";
    if (!dateKey || dateKey < fromKey || dateKey > toKey) continue;

    const day = days[dateKey];
    if (!day || day.closed) continue;

    const slotRaw =
      (typeof lead.timeSlot === "string" && lead.timeSlot) ||
      parseBookingDateValue(typeof lead.date === "string" ? lead.date : "")?.slot ||
      null;

    const slot = (BOOKING_SLOTS as readonly string[]).includes(slotRaw || "")
      ? (slotRaw as BookingSlot)
      : null;

    if (slot && day.slots[slot]) {
      day.slots[slot].count += 1;
      day.total += 1;
    } else {
      day.total += 1;
      const soft =
        BOOKING_SLOTS.find((s) => day.slots[s].count < settings.slotCapacity) ?? BOOKING_SLOTS[0];
      day.slots[soft].count += 1;
    }
  }

  for (const day of Object.values(days)) {
    for (const s of BOOKING_SLOTS) {
      const cell = day.slots[s];
      cell.capacity = settings.slotCapacity;
      cell.full = day.closed || cell.count >= settings.slotCapacity;
    }
  }

  return { settings, days, fromKey, toKey };
}

export async function assertSlotAvailable(
  payload: Payload,
  dateKey: string,
  timeSlot: string,
): Promise<{ ok: true; capacity: number; count: number } | { ok: false; error: string }> {
  const settings = await getBookingSettings(payload);

  if (!settings.enabled) {
    return { ok: false, error: "Онлайн-запись временно закрыта. Позвоните нам." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return { ok: false, error: "Некорректная дата" };
  }
  if (!(BOOKING_SLOTS as readonly string[]).includes(timeSlot)) {
    return { ok: false, error: "Выберите время из календаря" };
  }
  if (settings.closedDates.has(dateKey)) {
    return { ok: false, error: "Этот день закрыт для записи" };
  }

  const todayKey = moscowTodayKey();
  if (dateKey < todayKey) {
    return { ok: false, error: "Нельзя записаться на прошедшую дату (время — МСК)" };
  }
  if (isSlotInPast(dateKey, timeSlot)) {
    return {
      ok: false,
      error: `Слот ${timeSlot} уже недоступен по московскому времени. Выберите другое время.`,
    };
  }

  const result = await payload.find({
    collection: "leads",
    depth: 0,
    limit: 100,
    where: {
      and: [
        { status: { in: [...OCCUPYING_STATUSES] } },
        {
          or: [
            {
              and: [
                { dateKey: { equals: dateKey } },
                { timeSlot: { equals: timeSlot } },
              ],
            },
            { date: { equals: formatBookingDate(dateKey, timeSlot) } },
          ],
        },
      ],
    },
  });

  // Deduplicate by id if both conditions match same docs
  const ids = new Set(result.docs.map((d) => String(d.id)));
  const count = ids.size;

  if (count >= settings.slotCapacity) {
    return {
      ok: false,
      error:
        settings.slotCapacity <= 1
          ? `На ${dateKey} · ${timeSlot} уже есть запись. Выберите другое время.`
          : `Слот ${dateKey} · ${timeSlot} уже заполнен (${count}/${settings.slotCapacity}). Выберите другое время.`,
    };
  }

  return { ok: true, capacity: settings.slotCapacity, count };
}
