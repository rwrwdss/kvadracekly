"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@payloadcms/ui";
import {
  addMonths,
  expandDateRange,
  monthLabelRu,
  moscowTodayKey,
  startOfMonth,
  toDateKey,
} from "@/lib/booking/slots";

type RangeRow = { id?: string | null; from: string; to: string; note?: string; days?: number };
type SingleRow = { id?: string | null; date: string; note?: string };

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"] as const;

export function CalendarStopsView() {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [closedDays, setClosedDays] = useState<Set<string>>(new Set());
  const [ranges, setRanges] = useState<RangeRow[]>([]);
  const [singles, setSingles] = useState<SingleRow[]>([]);
  const [pickFrom, setPickFrom] = useState<string | null>(null);
  const [pickTo, setPickTo] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const todayKey = moscowTodayKey();

  const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;

  const refreshStops = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [stopsRes, calRes] = await Promise.all([
        fetch("/api/admin/calendar/stops", { credentials: "include" }),
        fetch(`/api/admin/calendar?month=${monthKey}`, { credentials: "include" }),
      ]);
      const stops = await stopsRes.json();
      const cal = await calRes.json();
      if (!stopsRes.ok) throw new Error(stops.error || "Ошибка");
      if (!calRes.ok) throw new Error(cal.error || "Ошибка календаря");

      setRanges(stops.ranges || []);
      setSingles(stops.singles || []);

      const closed = new Set<string>();
      for (const [key, day] of Object.entries(cal.days || {}) as [string, { closed?: boolean }][]) {
        if (day.closed) closed.add(key);
      }
      setClosedDays(closed);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }, [monthKey]);

  useEffect(() => {
    void refreshStops();
  }, [refreshStops]);

  const previewDays = useMemo(() => {
    if (!pickFrom) return new Set<string>();
    const to = pickTo || pickFrom;
    return new Set(expandDateRange(pickFrom, to));
  }, [pickFrom, pickTo]);

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

  function onDayClick(key: string) {
    setMessage("");
    if (!pickFrom || (pickFrom && pickTo)) {
      setPickFrom(key);
      setPickTo(null);
      return;
    }
    setPickTo(key);
  }

  async function saveStop() {
    if (!pickFrom) return;
    const from = pickFrom;
    const to = pickTo || pickFrom;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/admin/calendar/stops", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ from, to, note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Не удалось сохранить");
      setMessage(`Остановлено: ${data.from} — ${data.to} (${data.days} дн.)`);
      setPickFrom(null);
      setPickTo(null);
      setNote("");
      await refreshStops();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  }

  async function removeRange(row: RangeRow) {
    const q = row.id
      ? `id=${encodeURIComponent(String(row.id))}`
      : `from=${encodeURIComponent(row.from)}&to=${encodeURIComponent(row.to)}`;
    const res = await fetch(`/api/admin/calendar/stops?${q}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Не удалось удалить");
      return;
    }
    await refreshStops();
  }

  async function removeSingle(row: SingleRow) {
    const q = row.id
      ? `id=${encodeURIComponent(String(row.id))}&date=${encodeURIComponent(row.date)}`
      : `date=${encodeURIComponent(row.date)}`;
    const res = await fetch(`/api/admin/calendar/stops?${q}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Не удалось удалить");
      return;
    }
    await refreshStops();
  }

  const rangeLabel =
    pickFrom && pickTo
      ? `${pickFrom <= pickTo ? pickFrom : pickTo} — ${pickFrom <= pickTo ? pickTo : pickFrom}`
      : pickFrom
        ? `${pickFrom} (выберите конец периода)`
        : "Кликните первый день, затем последний";

  return (
    <div className="admin-cal">
      <header className="admin-cal__header">
        <div>
          <p className="admin-cal__eyebrow">Календарь</p>
          <h1 className="admin-cal__title">Остановка записей</h1>
          <p className="admin-cal__lead">
            Выберите период на копии умного календаря. Записаться можно <strong>до</strong> или{" "}
            <strong>после</strong> остановки, но не в эти дни.{" "}
            <Link href="/admin/calendar">← К записям</Link>
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
      {message ? <p className="admin-cal__ok">{message}</p> : null}
      {loading ? <p className="admin-cal__mute">Загрузка…</p> : null}

      <div className="admin-cal__stop-bar">
        <p>
          Период: <strong>{rangeLabel}</strong>
        </p>
        <input
          className="admin-cal__input"
          placeholder="Причина (необязательно)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="admin-cal__stop-actions">
          <button
            type="button"
            className="admin-cal__btn admin-cal__btn--primary"
            disabled={!pickFrom || saving}
            onClick={() => void saveStop()}
          >
            {saving ? "Сохраняем…" : "Остановить записи"}
          </button>
          <button
            type="button"
            className="admin-cal__btn"
            disabled={!pickFrom}
            onClick={() => {
              setPickFrom(null);
              setPickTo(null);
            }}
          >
            Сбросить выбор
          </button>
        </div>
      </div>

      <div className="admin-cal__grid-wrap">
        <div className="admin-cal__weekdays">
          {WEEKDAYS.map((w) => (
            <span key={w}>{w}</span>
          ))}
        </div>
        <div className="admin-cal__grid">
          {cells.map((cell, i) => {
            if (!cell.key) return <div key={`e-${i}`} className="admin-cal-day admin-cal-day--empty" />;
            const closed = closedDays.has(cell.key);
            const inPreview = previewDays.has(cell.key);
            const isToday = cell.key === todayKey;
            return (
              <button
                key={cell.key}
                type="button"
                className={`admin-cal-day ${closed ? "admin-cal-day--closed" : ""} ${inPreview ? "admin-cal-day--preview" : ""} ${isToday ? "admin-cal-day--today" : ""}`}
                onClick={() => onDayClick(cell.key!)}
              >
                <span className="admin-cal-day__n">{cell.label}</span>
                {closed ? <span className="admin-cal-day__tag">стоп</span> : null}
              </button>
            );
          })}
        </div>
      </div>

      <section className="admin-cal__list">
        <h2 className="admin-cal__aside-title">Активные остановки</h2>
        {ranges.length === 0 && singles.length === 0 ? (
          <p className="admin-cal__mute">Пока нет остановок — календарь открыт.</p>
        ) : (
          <ul className="admin-cal__ranges">
            {ranges.map((r) => (
              <li key={r.id || `${r.from}-${r.to}`}>
                <div>
                  <strong>
                    {r.from === r.to ? r.from : `${r.from} — ${r.to}`}
                  </strong>
                  <span className="admin-cal__mute">
                    {" "}
                    · {r.days || expandDateRange(r.from, r.to).length} дн.
                    {r.note ? ` · ${r.note}` : ""}
                  </span>
                </div>
                <button type="button" className="admin-cal__btn" onClick={() => void removeRange(r)}>
                  Снять
                </button>
              </li>
            ))}
            {singles.map((s) => (
              <li key={s.id || s.date}>
                <div>
                  <strong>{s.date}</strong>
                  <span className="admin-cal__mute">{s.note ? ` · ${s.note}` : " · день"}</span>
                </div>
                <button type="button" className="admin-cal__btn" onClick={() => void removeSingle(s)}>
                  Снять
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default CalendarStopsView;
