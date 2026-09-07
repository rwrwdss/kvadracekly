"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@payloadcms/ui";
import {
  addMonths,
  dayTotalLoad,
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

type LeadBrief = {
  id: string | number;
  name: string;
  phone: string;
  timeSlot?: string | null;
  status: string;
  route?: string | null;
  durationMinutes?: number | null;
  bookingKind?: string | null;
};

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"] as const;

function loadClass(load: SlotLoad, closed?: boolean) {
  if (closed) return "admin-cal-day--closed";
  if (load === "full") return "admin-cal-day--full";
  if (load === "busy") return "admin-cal-day--busy";
  if (load === "light") return "admin-cal-day--light";
  return "";
}

export function CalendarBookingsView() {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [days, setDays] = useState<Record<string, DayAvail>>({});
  const [leadsByDay, setLeadsByDay] = useState<Record<string, LeadBrief[]>>({});
  const [selectedDay, setSelectedDay] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const todayKey = moscowTodayKey();

  const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;

  const fetchMonth = useCallback(async (key: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/calendar?month=${key}`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка загрузки");
      setDays(data.days || {});
      setLeadsByDay(data.leadsByDay || {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
      setDays({});
      setLeadsByDay({});
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
    const out: { key: string | null; label: number | null }[] = [];
    for (let i = 0; i < startPad; i++) out.push({ key: null, label: null });
    for (let d = 1; d <= daysInMonth; d++) {
      const key = toDateKey(new Date(month.getFullYear(), month.getMonth(), d));
      out.push({ key, label: d });
    }
    return out;
  }, [month]);

  const selectedLeads = selectedDay ? leadsByDay[selectedDay] || [] : [];
  const selectedDayData = selectedDay ? days[selectedDay] : null;

  return (
    <div className="admin-cal">
      <div className="admin-cal__back">
        <Link href="/admin" prefetch={false}>
          ← Назад в CRM
        </Link>
      </div>
      <header className="admin-cal__header">
        <div>
          <p className="admin-cal__eyebrow">Календарь</p>
          <h1 className="admin-cal__title">Записи</h1>
          <p className="admin-cal__lead">
            Умный календарь с занятостью слотов. Заявки — в CRM.{" "}
            <Link href="/admin/calendar/stops">Остановить период →</Link>
          </p>
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

      {error ? <p className="admin-cal__error">{error}</p> : null}
      {loading ? <p className="admin-cal__mute">Загрузка…</p> : null}

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
            const load = day
              ? dayTotalLoad(
                  Object.fromEntries(
                    Object.entries(day.slots || {}).map(([s, v]) => [s, v.count]),
                  ),
                )
              : ("free" as SlotLoad);
            const isToday = cell.key === todayKey;
            const selected = cell.key === selectedDay;
            return (
              <button
                key={cell.key}
                type="button"
                className={`admin-cal-day ${loadClass(load, closed)} ${isToday ? "admin-cal-day--today" : ""} ${selected ? "admin-cal-day--selected" : ""}`}
                onClick={() => setSelectedDay(cell.key!)}
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
            <h2 className="admin-cal__aside-title">{selectedDay}</h2>
            {selectedDayData?.closed ? (
              <p className="admin-cal__warn">День остановлен — запись на сайте недоступна.</p>
            ) : null}
            <div className="admin-cal__slots">
              {Object.entries(selectedDayData?.slots || {}).map(([slot, info]) => {
                const load = slotLoad(info.count, info.capacity);
                return (
                  <div key={slot} className={`admin-cal__slot admin-cal__slot--${load}`}>
                    <strong>{slot}</strong>
                    <span>
                      {info.count}/{info.capacity}
                    </span>
                  </div>
                );
              })}
            </div>
            <h3 className="admin-cal__aside-sub">Заявки</h3>
            {selectedLeads.length === 0 ? (
              <p className="admin-cal__mute">Нет активных заявок на этот день.</p>
            ) : (
              <ul className="admin-cal__leads">
                {selectedLeads.map((lead) => (
                  <li key={lead.id}>
                    <Link href={`/admin/collections/leads/${lead.id}`}>
                      {lead.bookingKind === "night"
                        ? "ночь"
                        : lead.timeSlot || "—"}{" "}
                      · {lead.name} · {lead.phone}
                    </Link>
                    <span className="admin-cal__mute">
                      {lead.route || "без маршрута"}
                      {lead.durationMinutes ? ` · ~${lead.durationMinutes} мин` : ""} ·{" "}
                      {lead.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className="admin-cal__mute">Выберите день, чтобы увидеть слоты и заявки.</p>
        )}
      </aside>
    </div>
  );
}

export default CalendarBookingsView;
