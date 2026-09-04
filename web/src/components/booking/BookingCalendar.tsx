"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BOOKING_SLOTS,
  SLOT_CAPACITY,
  addMonths,
  dayLabelRu,
  dayTotalLoad,
  formatBookingDate,
  getMoscowParts,
  isDayFullyPast,
  isSlotInPast,
  monthLabelRu,
  moscowTodayKey,
  slotLoad,
  startOfMonth,
  toDateKey,
  type SlotLoad,
} from "@/lib/booking/slots";

type DayAvail = {
  date: string;
  closed?: boolean;
  slots: Record<string, { count: number; capacity: number; full?: boolean }>;
  total: number;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  name?: string;
  required?: boolean;
};

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"] as const;

function loadDotClass(load: SlotLoad) {
  if (load === "full") return "bg-[var(--diff-hard)]";
  if (load === "busy") return "bg-[var(--diff-medium)]";
  if (load === "light") return "bg-accent/70";
  return "bg-transparent";
}

function slotButtonClass(load: SlotLoad, selected: boolean, past: boolean) {
  if (past) {
    return "border-[var(--border-subtle)] text-faint opacity-40 cursor-not-allowed";
  }
  if (selected) {
    return "border-[var(--accent-border)] bg-accent text-on-accent";
  }
  if (load === "full") {
    return "border-[var(--border-subtle)] text-faint opacity-45 cursor-not-allowed";
  }
  if (load === "busy") {
    return "border-[rgba(212,164,90,0.45)] bg-[rgba(212,164,90,0.08)] text-mute hover:border-accent";
  }
  if (load === "light") {
    return "border-[var(--border-subtle)] bg-card text-mute hover:border-accent hover:text-ink";
  }
  return "border-[var(--border-subtle)] text-mute hover:border-accent hover:text-ink";
}

export function BookingCalendar({ value, onChange, name = "date", required }: Props) {
  const [nowTick, setNowTick] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNowTick(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const now = useMemo(() => new Date(nowTick), [nowTick]);
  const todayKey = useMemo(() => moscowTodayKey(now), [now]);

  const [month, setMonth] = useState(() => {
    const p = getMoscowParts();
    return new Date(p.year, p.month - 1, 1);
  });
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [days, setDays] = useState<Record<string, DayAvail>>({});
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [capacity, setCapacity] = useState(SLOT_CAPACITY);

  useEffect(() => {
    if (!value) {
      setSelectedDay("");
      setSelectedSlot("");
      return;
    }
    const m = /^(\d{4}-\d{2}-\d{2})\s*·\s*(\d{1,2}:\d{2})/.exec(value.trim());
    if (m) {
      setSelectedDay(m[1]);
      setSelectedSlot(m[2].length === 4 ? `0${m[2]}` : m[2]);
      const [y, mo] = m[1].split("-").map(Number);
      setMonth(new Date(y, mo - 1, 1));
      return;
    }
    const d = /^(\d{4}-\d{2}-\d{2})/.exec(value.trim());
    if (d) {
      setSelectedDay(d[1]);
      const [y, mo] = d[1].split("-").map(Number);
      setMonth(new Date(y, mo - 1, 1));
    }
  }, [value]);

  // Сброс выбора, если слот успел стать прошлым по МСК
  useEffect(() => {
    if (!selectedDay || !selectedSlot) return;
    if (isSlotInPast(selectedDay, selectedSlot, now)) {
      setSelectedSlot("");
      onChange("");
    }
  }, [now, selectedDay, selectedSlot, onChange]);

  const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;

  const fetchMonth = useCallback(async (key: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/booking-availability?month=${key}`);
      const data = await res.json();
      setDays((data.days as Record<string, DayAvail>) || {});
      setEnabled(data.enabled !== false);
      if (typeof data.capacity === "number" && data.capacity >= 1) {
        setCapacity(data.capacity);
      }
    } catch {
      setDays({});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMonth(monthKey);
  }, [monthKey, fetchMonth]);

  const cells = useMemo(() => {
    const first = startOfMonth(month);
    const startPad = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const list: ({ type: "empty" } | { type: "day"; date: Date; key: string })[] = [];
    for (let i = 0; i < startPad; i++) list.push({ type: "empty" });
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(month.getFullYear(), month.getMonth(), d);
      list.push({ type: "day", date, key: toDateKey(date) });
    }
    return list;
  }, [month]);

  function pickDay(key: string) {
    if (key < todayKey || isDayFullyPast(key, now)) return;
    if (days[key]?.closed) return;
    setSelectedDay(key);
    setSelectedSlot("");
    onChange("");
  }

  function pickSlot(slot: string) {
    if (!selectedDay) return;
    if (isSlotInPast(selectedDay, slot, now)) return;
    const info = days[selectedDay]?.slots[slot];
    const count = info?.count ?? 0;
    const cap = info?.capacity ?? capacity;
    if (info?.full || count >= cap) return;
    setSelectedSlot(slot);
    onChange(formatBookingDate(selectedDay, slot));
  }

  const daySlots = selectedDay ? days[selectedDay]?.slots : undefined;

  if (!enabled) {
    return (
      <fieldset className="booking-cal grid gap-2">
        <legend className="text-sm text-mute">Желаемая дата и время</legend>
        <input type="hidden" name={name} value="" />
        <div className="border border-[var(--border-subtle)] p-4 text-sm text-mute">
          Онлайн-запись временно закрыта. Позвоните нам или напишите в мессенджер — поставим в очередь
          вручную.
        </div>
      </fieldset>
    );
  }

  return (
    <fieldset className="booking-cal grid gap-3">
      <legend className="text-sm text-mute mb-0.5">Желаемая дата и время (МСК)</legend>
      <input type="hidden" name={name} value={value} required={required} />

      <div className="border border-[var(--border-subtle)] bg-card/60 p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <button
            type="button"
            className="grid h-9 w-9 place-items-center border border-[var(--border-subtle)] text-mute hover:text-accent hover:border-accent transition-colors"
            aria-label="Предыдущий месяц"
            onClick={() => setMonth((m) => addMonths(m, -1))}
          >
            ‹
          </button>
          <p className="font-display text-sm sm:text-[1rem] uppercase tracking-[0.12em] text-ink capitalize !text-[var(--text-primary)]">
            {monthLabelRu(month)}
            {loading && (
              <span className="ml-2 text-[10px] text-faint normal-case tracking-normal">…</span>
            )}
          </p>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center border border-[var(--border-subtle)] text-mute hover:text-accent hover:border-accent transition-colors"
            aria-label="Следующий месяц"
            onClick={() => setMonth((m) => addMonths(m, 1))}
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {WEEKDAYS.map((w) => (
            <div
              key={w}
              className="text-center text-[10px] sm:text-[11px] uppercase tracking-wider text-faint py-1"
            >
              {w}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1" role="grid" aria-label="Календарь записи">
          {cells.map((cell, i) => {
            if (cell.type === "empty") {
              return <div key={`e-${i}`} className="aspect-square" />;
            }
            const past = cell.key < todayKey || isDayFullyPast(cell.key, now);
            const closed = Boolean(days[cell.key]?.closed);
            const selected = selectedDay === cell.key;
            const todayMark = cell.key === todayKey;
            const load = dayTotalLoad(
              Object.fromEntries(
                BOOKING_SLOTS.map((s) => [s, days[cell.key]?.slots[s]?.count ?? 0]),
              ),
              capacity,
            );
            const dayFull =
              !closed &&
              !past &&
              Boolean(days[cell.key]) &&
              BOOKING_SLOTS.every((s) => {
                if (isSlotInPast(cell.key, s, now)) return true;
                return (days[cell.key]?.slots[s]?.count ?? 0) >= capacity;
              });
            const blocked = past || closed || dayFull;

            return (
              <button
                key={cell.key}
                type="button"
                role="gridcell"
                disabled={blocked}
                aria-selected={selected}
                aria-label={`${cell.key}${closed ? ", закрыто" : past ? ", прошло" : dayFull ? ", мест нет" : ""}`}
                onClick={() => pickDay(cell.key)}
                className={[
                  "relative aspect-square flex flex-col items-center justify-center text-sm transition-colors",
                  "border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent",
                  blocked
                    ? "border-transparent text-faint/40 cursor-not-allowed line-through decoration-faint/40"
                    : selected
                      ? "border-accent bg-accent text-on-accent"
                      : todayMark
                        ? "border-[var(--accent-border)] text-ink hover:bg-accent-muted"
                        : "border-transparent text-mute hover:border-[var(--border-subtle)] hover:bg-elevated",
                ].join(" ")}
              >
                <span className="leading-none no-underline">{cell.date.getDate()}</span>
                {!blocked && !selected && load !== "free" && (
                  <span
                    className={`absolute bottom-1 h-1 w-1 rounded-full ${loadDotClass(load)}`}
                    aria-hidden
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[10px] sm:text-[11px] text-faint uppercase tracking-wide">
          <span className="inline-flex items-center gap-1.5">
            <i className="h-1.5 w-1.5 rounded-full bg-accent/70" /> очередь
          </span>
          <span className="inline-flex items-center gap-1.5">
            <i className="h-1.5 w-1.5 rounded-full bg-[var(--diff-medium)]" /> плотно
          </span>
          <span className="inline-flex items-center gap-1.5">
            <i className="h-1.5 w-1.5 rounded-full bg-[var(--diff-hard)]" /> занято
          </span>
        </div>
      </div>

      {selectedDay && (
        <div className="grid gap-2">
          <p className="text-xs text-faint">
            Слоты на{" "}
            <span className="text-mute normal-case">{dayLabelRu(selectedDay)}</span>
            <span className="ml-1">(МСК)</span>
          </p>
          <div
            className="grid grid-cols-2 sm:grid-cols-3 gap-2"
            role="listbox"
            aria-label="Время выезда"
          >
            {BOOKING_SLOTS.map((slot) => {
              const count = daySlots?.[slot]?.count ?? 0;
              const cap = daySlots?.[slot]?.capacity ?? capacity;
              const load = slotLoad(count, cap);
              const selected = selectedSlot === slot;
              const past = isSlotInPast(selectedDay, slot, now);
              const full = !past && (Boolean(daySlots?.[slot]?.full) || load === "full");
              const disabled = past || full;
              return (
                <button
                  key={slot}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  disabled={disabled}
                  onClick={() => pickSlot(slot)}
                  className={[
                    "flex flex-col items-start gap-0.5 px-3 py-2.5 border text-left transition-colors",
                    slotButtonClass(load, selected, past),
                  ].join(" ")}
                >
                  <span className="font-display text-sm tracking-wide">{slot}</span>
                  <span
                    className={`text-[10px] uppercase tracking-wider ${
                      selected ? "text-on-accent/80" : "text-faint"
                    }`}
                  >
                    {past
                      ? "прошло"
                      : full
                        ? capacity <= 1
                          ? "занято"
                          : "мест нет"
                        : count === 0
                          ? "свободно"
                          : `в очереди ${count}/${cap}`}
                  </span>
                </button>
              );
            })}
          </div>
          {value ? (
            <p className="text-xs text-accent">Выбрано: {value} (МСК)</p>
          ) : (
            <p className="text-xs text-faint">
              Выберите время — прошедшие слоты недоступны (часовой пояс Москва)
            </p>
          )}
        </div>
      )}
    </fieldset>
  );
}
