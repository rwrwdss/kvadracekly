"use client";

import React, { useMemo, useState } from "react";
import { Link } from "@payloadcms/ui";
import { ROUTES } from "@/data/site";
import { resolveDurationMinutes } from "@/lib/booking/slots";
import { AdminSlotPicker } from "./AdminSlotPicker";

const SOURCES = [
  { value: "crm_site_call", label: "Звонок с сайта" },
  { value: "crm_social", label: "Соцсети" },
  { value: "crm_other", label: "Другое" },
] as const;

export function NewLeadView() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [source, setSource] = useState<(typeof SOURCES)[number]["value"]>("crm_site_call");
  const [route, setRoute] = useState(ROUTES[0]?.title || "");
  const [guests, setGuests] = useState(1);
  const [hasChildren, setHasChildren] = useState<"yes" | "no">("no");
  const [date, setDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const durationMinutes = useMemo(() => resolveDurationMinutes(route), [route]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setOk("");
    if (!name.trim() || name.trim().length < 2) {
      setError("Укажите имя (минимум 2 символа)");
      return;
    }
    if (!phone.trim()) {
      setError("Укажите телефон");
      return;
    }
    if (!route) {
      setError("Выберите маршрут");
      return;
    }
    if (!date) {
      setError("Выберите дату и время в календаре");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/leads/create", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          source,
          route,
          guests,
          hasChildren: hasChildren === "yes",
          date,
          durationMinutes,
          bookingKind: "day",
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        id?: string | number;
        customerId?: string | number;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Не удалось сохранить");
      }
      setOk("Заявка создана, клиент сохранён.");
      window.setTimeout(() => {
        window.location.assign(`/admin/collections/leads/${data.id}`);
      }, 450);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-new-lead">
      <div className="admin-cal__back">
        <Link href="/admin" prefetch={false}>
          ← Назад в CRM
        </Link>
        <span className="admin-cal__back-sep" aria-hidden>
          /
        </span>
        <Link href="/admin/collections/leads" prefetch={false}>
          Заявки
        </Link>
      </div>

      <header className="admin-new-lead__header">
        <p className="admin-cal__eyebrow">CRM</p>
        <h1 className="admin-cal__title">Новая заявка</h1>
        <p className="admin-cal__lead">
          Ручная запись по звонку или из соцсетей. Клиент создаётся или обновляется по телефону.
        </p>
      </header>

      <form className="admin-new-lead__form" onSubmit={(e) => void onSubmit(e)}>
        <div className="admin-new-lead__fields">
          <label className="admin-new-lead__field">
            <span>Имя</span>
            <input
              className="admin-cal__input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
              minLength={2}
              placeholder="Иван"
            />
          </label>

          <label className="admin-new-lead__field">
            <span>Телефон</span>
            <input
              className="admin-cal__input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              required
              placeholder="+7…"
              inputMode="tel"
            />
          </label>

          <fieldset className="admin-new-lead__fieldset">
            <legend>Откуда клиент</legend>
            <div className="admin-new-lead__toggles" role="radiogroup" aria-label="Откуда клиент">
              {SOURCES.map((s) => (
                <label key={s.value} className={`admin-new-lead__toggle ${source === s.value ? "is-on" : ""}`}>
                  <input
                    type="radio"
                    name="source"
                    value={s.value}
                    checked={source === s.value}
                    onChange={() => setSource(s.value)}
                  />
                  <span>{s.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="admin-new-lead__field">
            <span>Маршрут</span>
            <select
              className="admin-cal__input"
              value={route}
              onChange={(e) => setRoute(e.target.value)}
              required
            >
              {ROUTES.map((r) => (
                <option key={r.id} value={r.title}>
                  {r.title} · {r.duration}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-new-lead__field">
            <span>Сколько человек</span>
            <input
              className="admin-cal__input"
              type="number"
              min={1}
              max={20}
              value={guests}
              onChange={(e) => setGuests(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
              required
            />
          </label>

          <fieldset className="admin-new-lead__fieldset">
            <legend>Есть дети 6+</legend>
            <div className="admin-new-lead__toggles" role="radiogroup" aria-label="Есть дети 6+">
              <label className={`admin-new-lead__toggle ${hasChildren === "yes" ? "is-on" : ""}`}>
                <input
                  type="radio"
                  name="hasChildren"
                  value="yes"
                  checked={hasChildren === "yes"}
                  onChange={() => setHasChildren("yes")}
                />
                <span>Да</span>
              </label>
              <label className={`admin-new-lead__toggle ${hasChildren === "no" ? "is-on" : ""}`}>
                <input
                  type="radio"
                  name="hasChildren"
                  value="no"
                  checked={hasChildren === "no"}
                  onChange={() => setHasChildren("no")}
                />
                <span>Нет</span>
              </label>
            </div>
          </fieldset>
        </div>

        <AdminSlotPicker value={date} onChange={setDate} durationMinutes={durationMinutes} />

        {error ? <p className="admin-cal__error">{error}</p> : null}
        {ok ? <p className="admin-cal__ok">{ok}</p> : null}

        <div className="admin-new-lead__actions">
          <button type="submit" className="admin-cal__btn admin-cal__btn--primary" disabled={saving}>
            {saving ? "Сохранение…" : "Сохранить заявку"}
          </button>
          <Link className="admin-cal__btn" href="/admin/collections/leads" prefetch={false}>
            К списку заявок
          </Link>
        </div>
      </form>
    </div>
  );
}

export default NewLeadView;
