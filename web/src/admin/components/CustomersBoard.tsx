"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "@payloadcms/ui";

type CustomerDoc = {
  id: number | string;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  completedThrough?: number | null;
  notes?: string | null;
  lastLeadAt?: string | null;
};

const PROGRESS: Record<number, string> = {
  0: "Новичок · открыто «Зелёное озеро»",
  1: "Пройдено озеро · открыт «Памятник»",
  2: "Открыт «Родник»",
  3: "Открыта «Экспедиция»",
  4: "Открыты «Лесные тропы»",
  5: "Все маршруты пройдены",
};

function progressLabel(value: number | null | undefined): string {
  const n = Math.max(0, Math.min(5, Number(value || 0)));
  return PROGRESS[n] || PROGRESS[0];
}

function formatDate(value?: string | null): string {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function CustomersBoard() {
  const { user } = useAuth();
  const role =
    user && typeof user === "object" && "role" in user
      ? String((user as { role?: string }).role || "")
      : "";
  const isManager = role === "manager";

  const [docs, setDocs] = useState<CustomerDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/customers?depth=0&limit=100&sort=-updatedAt", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Не удалось загрузить клиентов");
      const data = (await res.json()) as { docs?: CustomerDoc[] };
      setDocs(data.docs || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isManager) return;
    void load();
  }, [isManager, load]);

  if (!isManager) return null;

  const q = query.trim().toLowerCase();
  const filtered = q
    ? docs.filter((d) => {
        const hay = `${d.name || ""} ${d.phone || ""} ${d.email || ""}`.toLowerCase();
        return hay.includes(q);
      })
    : docs;

  return (
    <section className="crm-board">
      <header className="crm-board__head">
        <div>
          <h1 className="crm-board__title">Клиенты</h1>
          <p className="crm-board__lead">Только просмотр — карточки гостей и прогресс маршрутов.</p>
        </div>
        <button className="crm-board__refresh" onClick={() => void load()} type="button">
          Обновить
        </button>
      </header>

      <label className="crm-board__search">
        <span className="crm-board__search-label">Поиск</span>
        <input
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Имя или телефон"
          type="search"
          value={query}
        />
      </label>

      {error ? <p className="crm-board__error">{error}</p> : null}
      {loading ? <p className="crm-board__mute">Загрузка…</p> : null}

      {!loading && filtered.length === 0 ? (
        <p className="crm-board__mute">Никого не найдено</p>
      ) : null}

      <div className="crm-board__list">
        {filtered.map((doc) => (
          <article className="crm-card crm-card--customer" key={String(doc.id)}>
            <div className="crm-card__row">
              <h2 className="crm-card__name">{doc.name || "Без имени"}</h2>
              <span className="crm-card__badge">Ур. {Number(doc.completedThrough || 0)}</span>
            </div>

            <div className="crm-card__contacts">
              {doc.phone ? (
                <a className="crm-card__phone" href={`tel:${doc.phone}`}>
                  {doc.phone}
                </a>
              ) : (
                <span className="crm-card__muted">Телефон не указан</span>
              )}
              {doc.email ? <span className="crm-card__muted">{doc.email}</span> : null}
            </div>

            <p className="crm-card__summary">{progressLabel(doc.completedThrough)}</p>
            <p className="crm-card__muted">Последняя заявка: {formatDate(doc.lastLeadAt)}</p>
            {doc.notes ? <p className="crm-card__notes">{doc.notes}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}
