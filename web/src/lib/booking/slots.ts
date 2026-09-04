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

/** Max active requests per time slot (3 = до трёх записей на одно окно). */
export const SLOT_CAPACITY = 3;

/** Макс. число гостей в одной заявке (не светим на фронте). */
export const MAX_GUESTS = 20;

/** Statuses that occupy a slot in the queue. */
export const OCCUPYING_STATUSES = ["new", "in_progress", "confirmed"] as const;

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
