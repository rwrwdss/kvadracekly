/** Booking calendar slots & occupancy helpers (shared client/server). */

export const BOOKING_TZ = "Europe/Moscow";

export const BOOKING_SLOTS = [
  "10:00",
  "12:00",
  "14:00",
  "16:00",
  "18:00",
  "20:00",
] as const;

export type BookingSlot = (typeof BOOKING_SLOTS)[number];

/** Max active requests per overlapping interval (3 = до трёх пересекающихся броней). */
export const SLOT_CAPACITY = 3;

/** Макс. число гостей в одной заявке (не светим на фронте). */
export const MAX_GUESTS = 20;

/** Конец рабочего дня (МСК), минуты от полуночи. */
export const DAY_END_MINUTES = 22 * 60;

/** Длительность по умолчанию, если тариф не указан. */
export const DEFAULT_DURATION_MINUTES = 60;

/** Длительности дневных маршрутов (минуты) — docs/booking-rules.md */
export const ROUTE_DURATION_MINUTES: Record<string, number> = {
  "Зелёное озеро": 60,
  Памятник: 90,
  Родник: 120,
  Экспедиция: 180,
};

/** Statuses that occupy a slot in the queue. */
export const OCCUPYING_STATUSES = ["new", "in_progress", "confirmed"] as const;

export function slotToMinutes(slot: string): number {
  const [h, min] = slot.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(min)) return NaN;
  return h * 60 + min;
}

export function intervalsOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/** Старт + длительность укладываются в режим 10:00–22:00. */
export function intervalFitsInDay(startSlot: string, durationMinutes: number): boolean {
  const start = slotToMinutes(startSlot);
  if (!Number.isFinite(start) || durationMinutes < 1) return false;
  return start + durationMinutes <= DAY_END_MINUTES;
}

export function resolveDurationMinutes(
  routeTitle?: string | null,
  explicit?: number | null,
): number {
  if (typeof explicit === "number" && Number.isFinite(explicit) && explicit >= 30) {
    return Math.min(480, Math.floor(explicit));
  }
  const title = String(routeTitle || "").trim();
  if (title && ROUTE_DURATION_MINUTES[title]) return ROUTE_DURATION_MINUTES[title];
  return DEFAULT_DURATION_MINUTES;
}

export function pad2(n: number) {
  return String(n).padStart(2, "0");
}

type MoscowParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  dateKey: string;
};

/** Текущие дата/время по Москве (не зависит от пояса сервера/браузера). */
export function getMoscowParts(now = new Date()): MoscowParts {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: BOOKING_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const map: Record<string, string> = {};
  for (const part of fmt.formatToParts(now)) {
    if (part.type !== "literal") map[part.type] = part.value;
  }
  const year = Number(map.year);
  const month = Number(map.month);
  const day = Number(map.day);
  let hour = Number(map.hour);
  if (hour === 24) hour = 0;
  const minute = Number(map.minute);
  return {
    year,
    month,
    day,
    hour,
    minute,
    dateKey: `${year}-${pad2(month)}-${pad2(day)}`,
  };
}

export function moscowTodayKey(now = new Date()): string {
  return getMoscowParts(now).dateKey;
}

/** Слот уже прошёл или идёт сейчас (МСК). */
export function isSlotInPast(dateKey: string, slot: string, now = new Date()): boolean {
  const msk = getMoscowParts(now);
  if (dateKey < msk.dateKey) return true;
  if (dateKey > msk.dateKey) return false;
  const [h, min] = slot.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(min)) return true;
  return h * 60 + min <= msk.hour * 60 + msk.minute;
}

/** Все слоты дня уже в прошлом (МСК). */
export function isDayFullyPast(dateKey: string, now = new Date()): boolean {
  const today = moscowTodayKey(now);
  if (dateKey < today) return true;
  if (dateKey > today) return false;
  return BOOKING_SLOTS.every((s) => isSlotInPast(dateKey, s, now));
}

/** Local calendar date as YYYY-MM-DD (для ячеек месяца). */
export function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function parseDateKey(key: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const day = Number(m[3]);
  const d = new Date(y, mo, day);
  if (d.getFullYear() !== y || d.getMonth() !== mo || d.getDate() !== day) return null;
  return d;
}

/** Inclusive YYYY-MM-DD range → day keys (safe for client + server). */
export function expandDateRange(from: string, to: string): string[] {
  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  const a = from <= to ? from : to;
  const b = from <= to ? to : from;
  if (!DATE_RE.test(a) || !DATE_RE.test(b)) return [];
  const start = parseDateKey(a);
  const end = parseDateKey(b);
  if (!start || !end) return [];
  const out: string[] = [];
  const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  while (cur <= last) {
    out.push(toDateKey(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

export function formatBookingDate(dateKey: string, slot: string): string {
  return `${dateKey} · ${slot}`;
}

/** Parse "YYYY-MM-DD · HH:MM" or plain "YYYY-MM-DD" / ISO-ish from CRM. */
export function parseBookingDateValue(value: string): { dateKey: string; slot: string | null } | null {
  const raw = value.trim();
  if (!raw) return null;

  const withSlot = /^(\d{4}-\d{2}-\d{2})\s*[·•T\s]\s*(\d{1,2}:\d{2})/.exec(raw);
  if (withSlot) {
    const slot = withSlot[2].length === 4 ? `0${withSlot[2]}` : withSlot[2];
    return { dateKey: withSlot[1], slot };
  }

  const dateOnly = /^(\d{4}-\d{2}-\d{2})/.exec(raw);
  if (dateOnly) return { dateKey: dateOnly[1], slot: null };

  return null;
}

export function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function addMonths(d: Date, delta: number) {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isBeforeDay(a: Date, b: Date) {
  const aa = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const bb = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return aa < bb;
}

export function monthLabelRu(d: Date) {
  return d.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });
}

export function dayLabelRu(dateKey: string) {
  const d = parseDateKey(dateKey);
  if (!d) return dateKey;
  return d.toLocaleDateString("ru-RU", {
    weekday: "short",
    day: "numeric",
    month: "long",
  });
}

export type SlotLoad = "free" | "light" | "busy" | "full";

export function slotLoad(count: number, capacity = SLOT_CAPACITY): SlotLoad {
  if (count >= capacity) return "full";
  if (count >= Math.ceil(capacity * 0.66)) return "busy";
  if (count >= 1) return "light";
  return "free";
}

export function dayTotalLoad(
  counts: Partial<Record<string, number>>,
  capacity = SLOT_CAPACITY,
): SlotLoad {
  const total = BOOKING_SLOTS.reduce((sum, s) => sum + (counts[s] ?? 0), 0);
  const dayCap = BOOKING_SLOTS.length * capacity;
  return slotLoad(total, dayCap);
}
