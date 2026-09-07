import type { Payload } from "payload";
import {
  BOOKING_SLOTS,
  DEFAULT_DURATION_MINUTES,
  OCCUPYING_STATUSES,
  SLOT_CAPACITY,
  expandDateRange,
  formatBookingDate,
  intervalFitsInDay,
  intervalsOverlap,
  isSlotInPast,
  moscowTodayKey,
  parseBookingDateValue,
  resolveDurationMinutes,
  slotToMinutes,
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

type OccupyingLead = {
  dateKey: string;
  timeSlot: string;
  durationMinutes: number;
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

function leadInterval(lead: OccupyingLead): { start: number; end: number } | null {
  const start = slotToMinutes(lead.timeSlot);
  if (!Number.isFinite(start)) return null;
  const duration = lead.durationMinutes >= 30 ? lead.durationMinutes : DEFAULT_DURATION_MINUTES;
  return { start, end: start + duration };
}

/** Сколько активных броней пересекают интервал [start, end) в этот день. */
export function countOverlappingLeads(
  leads: OccupyingLead[],
  dateKey: string,
  startMinutes: number,
  endMinutes: number,
): number {
  let count = 0;
  for (const lead of leads) {
    if (lead.dateKey !== dateKey) continue;
    const iv = leadInterval(lead);
    if (!iv) continue;
    if (intervalsOverlap(startMinutes, endMinutes, iv.start, iv.end)) count += 1;
  }
  return count;
}

async function loadOccupyingLeads(
  payload: Payload,
  fromKey?: string,
  toKey?: string,
): Promise<OccupyingLead[]> {
  const result = await payload.find({
    collection: "leads",
    depth: 0,
    limit: 500,
    where: {
      and: [{ status: { in: [...OCCUPYING_STATUSES] } }],
    },
    overrideAccess: true,
  });

  const out: OccupyingLead[] = [];
  for (const lead of result.docs) {
    const dateKey =
      (typeof lead.dateKey === "string" && lead.dateKey) ||
      parseBookingDateValue(typeof lead.date === "string" ? lead.date : "")?.dateKey ||
      "";
    if (!dateKey) continue;
    if (fromKey && dateKey < fromKey) continue;
    if (toKey && dateKey > toKey) continue;

    const slotRaw =
      (typeof lead.timeSlot === "string" && lead.timeSlot) ||
      parseBookingDateValue(typeof lead.date === "string" ? lead.date : "")?.slot ||
      null;
    if (!slotRaw || !(BOOKING_SLOTS as readonly string[]).includes(slotRaw)) continue;

    const durationMinutes = resolveDurationMinutes(
      typeof lead.route === "string" ? lead.route : "",
      typeof lead.durationMinutes === "number" ? lead.durationMinutes : null,
    );

    out.push({
      dateKey,
      timeSlot: slotRaw,
      durationMinutes,
    });
  }
  return out;
}

/**
 * Занятость месяца. Если передан durationMinutes — full считается по пересечению
 * интервала [старт, старт+duration) с уже занятыми бронями.
 */
export async function buildMonthAvailability(
  payload: Payload,
  year: number,
  monthIndex: number,
  durationMinutes: number = DEFAULT_DURATION_MINUTES,
): Promise<{
  settings: BookingSettings;
  days: Record<string, DayAvailability>;
  fromKey: string;
  toKey: string;
  durationMinutes: number;
}> {
  const settings = await getBookingSettings(payload);
  const from = new Date(year, monthIndex, 1);
  const to = new Date(year, monthIndex + 1, 0);
  const fromKey = toDateKey(from);
  const toKey = toDateKey(to);
  const duration = resolveDurationMinutes(null, durationMinutes);

  const days: Record<string, DayAvailability> = {};
  for (let day = 1; day <= to.getDate(); day++) {
    const key = toDateKey(new Date(year, monthIndex, day));
    days[key] = emptyDay(key, settings.slotCapacity, settings.closedDates.has(key));
  }

  const leads = await loadOccupyingLeads(payload, fromKey, toKey);

  for (const day of Object.values(days)) {
    if (day.closed) continue;
    let total = 0;
    for (const slot of BOOKING_SLOTS) {
      const start = slotToMinutes(slot);
      const end = start + duration;
      const fits = intervalFitsInDay(slot, duration);
      const count = fits
        ? countOverlappingLeads(leads, day.date, start, end)
        : settings.slotCapacity;
      day.slots[slot] = {
        count: fits ? count : 0,
        capacity: settings.slotCapacity,
        full: !fits || count >= settings.slotCapacity,
      };
      if (fits) total += count;
    }
    day.total = total;
  }

  return { settings, days, fromKey, toKey, durationMinutes: duration };
}

export async function assertSlotAvailable(
  payload: Payload,
  dateKey: string,
  timeSlot: string,
  durationMinutes: number = DEFAULT_DURATION_MINUTES,
): Promise<{ ok: true; capacity: number; count: number } | { ok: false; error: string }> {
  const settings = await getBookingSettings(payload);
  const duration = resolveDurationMinutes(null, durationMinutes);

  if (!settings.enabled) {
    return { ok: false, error: "Онлайн-запись временно закрыта. Позвоните нам." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return { ok: false, error: "Некорректная дата" };
  }
  if (!(BOOKING_SLOTS as readonly string[]).includes(timeSlot)) {
    return { ok: false, error: "Выберите время из календаря" };
  }
  if (!intervalFitsInDay(timeSlot, duration)) {
    return {
      ok: false,
      error: `Маршрут ~${duration} мин не укладывается в режим до 22:00 при старте ${timeSlot}. Выберите более раннее время.`,
    };
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

  const leads = await loadOccupyingLeads(payload, dateKey, dateKey);
  const start = slotToMinutes(timeSlot);
  const count = countOverlappingLeads(leads, dateKey, start, start + duration);

  if (count >= settings.slotCapacity) {
    return {
      ok: false,
      error:
        settings.slotCapacity <= 1
          ? `На ${dateKey} · ${timeSlot} уже есть пересекающаяся запись. Выберите другое время.`
          : `Интервал ${dateKey} · ${timeSlot} (~${duration} мин) заполнен (${count}/${settings.slotCapacity}). Выберите другое время.`,
    };
  }

  return { ok: true, capacity: settings.slotCapacity, count };
}

/** @deprecated kept for callers that still pass exact display string */
export function formatSlotLabel(dateKey: string, timeSlot: BookingSlot) {
  return formatBookingDate(dateKey, timeSlot);
}
