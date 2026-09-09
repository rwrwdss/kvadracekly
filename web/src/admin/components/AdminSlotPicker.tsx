"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BOOKING_SLOTS,
  SLOT_CAPACITY,
  addMonths,
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
  durationMinutes?: number;
};

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"] as const;

function loadClass(load: SlotLoad, closed?: boolean) {
  if (closed) return "admin-cal-day--closed";
  if (load === "full") return "admin-cal-day--full";
  if (load === "busy") return "admin-cal-day--busy";
  if (load === "light") return "admin-cal-day--light";
  return "";
}

/** Умный календарь слотов для CRM (тот же API, что на сайте). */
export function AdminSlotPicker({ value, onChange, durationMinutes = 60 }: Props) {
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
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
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

  useEffect(() => {
    if (!selectedDay || !selectedSlot) return;
    if (isSlotInPast(selectedDay, selectedSlot, now)) {
      setSelectedSlot("");
      onChange("");
    }
  }, [now, selectedDay, selectedSlot, onChange]);

  const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;

  const fetchMonth = useCallback(async (key: string, duration: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/booking-availability?month=${key}&duration=${encodeURIComponent(String(duration))}`,
        { credentials: "include" },
      );
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
    void fetchMonth(monthKey, durationMinutes);
  }, [monthKey, durationMinutes, fetchMonth]);

  const prevDuration = useRef(durationMinutes);
  useEffect(() => {
    if (prevDuration.current === durationMinutes) return;
    prevDuration.current = durationMinutes;
    setSelectedSlot("");
    if (value) onChange("");
  }, [durationMinutes, value, onChange]);

  const cells = useMemo(() => {
    const first = startOfMonth(month);
    const startPad = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const out: { key: string | null; label: number | null }[] = [];
    for (let i = 0; i < startPad; i++) out.push({ key: null, label: null });
    for (let d = 1; d <= daysInMonth; d++) {
      const key = toDateKey(new Date(month.getFullYear(), month.getMonth(), d));
      out.push({ key, label: d });
    }
    return out;
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

  if (!enabled) {
    return (
      <div className="admin-cal admin-cal--picker">
        <p className="admin-cal__warn">Онлайн-запись временно отключена. Выберите дату позже или уточните у администратора.</p>
      </div>
    );
  }

  return (
    <div className="admin-cal admin-cal--picker">
      <header className="admin-cal__header">
        <div>
          <p className="admin-cal__eyebrow">Дата и время</p>
          <h2 className="admin-cal__aside-title">Умный календарь</h2>
          <p className="admin-cal__lead">Свободные слоты с учётом длительности маршрута.</p>
        </div>
        <div className="admin-cal__nav-months">
          <button type="button" className="admin-cal__btn" onClick={() => setMonth((m) => addMonths(m, -1))}>
            ←
          </button>
          <span className="admin-cal__month">{monthLabelRu(month)}</span>
          <button type="button" className="admin-cal__btn" onClick={() => setMonth((m) => addMonths(m, 1))}>
            →
          </button>
        </div>
      </header>

      {loading ? <p className="admin-cal__mute">Загрузка слотов…</p> : null}

      <div className="admin-cal__grid-wrap">
        <div className="admin-cal__weekdays">
          {WEEKDAYS.map((w) => (
            <span key={w}>{w}</span>
          ))}
        </div>
        <div className="admin-cal__grid">
          {cells.map((cell, i) => {
            if (!cell.key) return <div key={`e-${i}`} className="admin-cal-day admin-cal-day--empty" />;
            const day = days[cell.key];
            const closed = Boolean(day?.closed);
            const past = cell.key < todayKey || isDayFullyPast(cell.key, now);
            const load = day
              ? dayTotalLoad(
                  Object.fromEntries(
                    Object.entries(day.slots || {}).map(([s, v]) => [s, v.count]),
                  ),
                )
              : ("free" as SlotLoad);
            const isToday = cell.key === todayKey;
            const selected = cell.key === selectedDay;
            const disabled = closed || past;
            return (
              <button
                key={cell.key}
                type="button"
                disabled={disabled}
                className={`admin-cal-day ${loadClass(load, closed)} ${isToday ? "admin-cal-day--today" : ""} ${selected ? "admin-cal-day--selected" : ""} ${past ? "admin-cal-day--past" : ""}`}
                onClick={() => pickDay(cell.key!)}
              >
                <span className="admin-cal-day__n">{cell.label}</span>
                {closed ? <span className="admin-cal-day__tag">стоп</span> : null}
                {!closed && day && day.total > 0 ? (
                  <span className="admin-cal-day__tag">{day.total}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <aside className="admin-cal__aside">
        {selectedDay ? (
          <>
            <h3 className="admin-cal__aside-title">{selectedDay}</h3>
            {days[selectedDay]?.closed ? (
              <p className="admin-cal__warn">День остановлен.</p>
            ) : (
              <div className="admin-cal__slots">
                {BOOKING_SLOTS.map((slot) => {
                  const info = days[selectedDay]?.slots[slot];
                  const count = info?.count ?? 0;
                  const cap = info?.capacity ?? capacity;
                  const load = slotLoad(count, cap);
                  const past = isSlotInPast(selectedDay, slot, now);
                  const full = Boolean(info?.full) || count >= cap;
                  const selected = selectedSlot === slot;
                  const disabled = past || full;
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={disabled}
                      className={`admin-cal__slot admin-cal__slot--pick admin-cal__slot--${load} ${selected ? "admin-cal__slot--selected" : ""}`}
                      onClick={() => pickSlot(slot)}
                    >
                      <strong>{slot}</strong>
                      <span>
                        {count}/{cap}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
            {value ? <p className="admin-cal__ok">Выбрано: {value}</p> : null}
          </>
        ) : (
          <p className="admin-cal__mute">Выберите день, затем свободное время.</p>
        )}
      </aside>
    </div>
  );
}

export default AdminSlotPicker;
