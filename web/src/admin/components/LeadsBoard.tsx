"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@payloadcms/ui";

type UserRef = {
  id: number | string;
  name?: string | null;
  email?: string | null;
} | null;

type LeadDoc = {
  id: number | string;
  name?: string | null;
  phone?: string | null;
  dateKey?: string | null;
  timeSlot?: string | null;
  date?: string | null;
  route?: string | null;
  riderExperience?: string | null;
  status?: string | null;
  guests?: number | null;
  assignee?: number | string | UserRef;
};

function riderExperienceLabel(value?: string | null): string | null {
  if (value === "novice") return "Новичок";
  if (value === "experienced") return "Уже катался";
  if (value === "regular") return "Постоянный гость";
  return null;
}

function assigneeLabel(assignee: LeadDoc["assignee"]): string | null {
  if (!assignee) return null;
  if (typeof assignee === "object") {
    return assignee.name || assignee.email || `Менеджер #${assignee.id}`;
  }
  return `Менеджер #${assignee}`;
}

function assigneeId(assignee: LeadDoc["assignee"]): string | null {
  if (!assignee) return null;
  if (typeof assignee === "object") return String(assignee.id);
  return String(assignee);
}

function formatWhen(doc: LeadDoc): string {
  if (doc.dateKey && doc.timeSlot) {
    const [y, m, d] = String(doc.dateKey).split("-");
    if (y && m && d) return `${d}.${m}.${y} · ${doc.timeSlot}`;
    return `${doc.dateKey} · ${doc.timeSlot}`;
  }
  if (doc.date) return String(doc.date);
  if (doc.dateKey) return String(doc.dateKey);
  return "Время не указано";
}

export function LeadsBoard() {
  const { user } = useAuth();
  const role =
    user && typeof user === "object" && "role" in user
      ? String((user as { role?: string }).role || "")
      : "";
  const isManager = role === "manager";
  const myId =
    user && typeof user === "object" && "id" in user
      ? String((user as { id: number | string }).id)
      : "";

  const [docs, setDocs] = useState<LeadDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/leads?depth=1&limit=100&sort=-createdAt", {
        credentials: "include",
      });
      const data = (await res.json().catch(() => ({}))) as {
        docs?: LeadDoc[];
        errors?: { message?: string }[];
        message?: string;
      };
      if (!res.ok) {
        throw new Error(
          data.errors?.[0]?.message || data.message || `Не удалось загрузить заявки (${res.status})`,
        );
      }
      setDocs(data.docs || []);
    } catch (e) {
      setDocs([]);
      const msg = e instanceof Error ? e.message : "Ошибка загрузки";
      setError(
        /failed to fetch|network|load failed|aborted/i.test(msg)
          ? "Сервер не ответил. Обновите страницу или перезапустите сайт."
          : msg,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isManager) return;
    void load();
  }, [isManager, load]);

  const claim = useCallback(
    async (id: number | string) => {
      setBusyId(String(id));
      setError(null);
      try {
        const res = await fetch(`/api/crm/leads/${id}/claim`, {
          method: "POST",
          credentials: "include",
        });
        const data = (await res.json().catch(() => ({}))) as {
          message?: string;
          errors?: { message?: string }[];
        };
        if (!res.ok) {
          throw new Error(
            data.message || data.errors?.[0]?.message || "Не удалось взять заявку",
          );
        }
        setConfirmId(null);
        await load();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Ошибка");
      } finally {
        setBusyId(null);
      }
    },
    [load],
  );

  const sorted = useMemo(() => {
    return [...docs].sort((a, b) => {
      const aTaken = Boolean(assigneeId(a.assignee));
      const bTaken = Boolean(assigneeId(b.assignee));
      if (aTaken !== bTaken) return aTaken ? 1 : -1;
      return 0;
    });
  }, [docs]);

  if (!isManager) return null;

  return (
    <section className="crm-board">
      <header className="crm-board__head">
        <div className="crm-board__head-text">
          <h1 className="crm-board__title">Заявки</h1>
          <p className="crm-board__lead">Свободные сверху. Взятые — затемнены.</p>
        </div>
        <button className="crm-board__refresh" onClick={() => void load()} type="button">
          Обновить
        </button>
      </header>

      {error ? <p className="crm-board__error">{error}</p> : null}
      {loading ? <p className="crm-board__mute">Загрузка…</p> : null}

      {!loading && !error && sorted.length === 0 ? (
        <p className="crm-board__mute">Заявок пока нет</p>
      ) : null}

      {!loading && error ? (
        <button className="crm-board__refresh" onClick={() => void load()} type="button">
          Повторить
        </button>
      ) : null}

      <div className="crm-board__list">
        {sorted.map((doc) => {
          const takenBy = assigneeLabel(doc.assignee);
          const taken = Boolean(takenBy);
          const mine = taken && assigneeId(doc.assignee) === myId;
          const id = String(doc.id);
          const route = doc.route?.trim() || "Маршрут не указан";
          const when = formatWhen(doc);
          const experience = riderExperienceLabel(doc.riderExperience);

          return (
            <article
              className={`crm-card crm-card--lead${taken ? " is-taken" : ""}${mine ? " is-mine" : ""}`}
              key={id}
            >
              <div className="crm-card__row">
                <h2 className="crm-card__name">{doc.name || "Без имени"}</h2>
                {!taken ? (
                  <span className="crm-card__badge crm-card__badge--free">Свободна</span>
                ) : (
                  <span className="crm-card__badge crm-card__badge--taken">
                    {mine ? "Ваша" : "Взята"}
                  </span>
                )}
              </div>

              <p className="crm-card__summary">
                <span className="crm-card__summary-route">{route}</span>
                {experience ? (
                  <>
                    <span className="crm-card__dot" aria-hidden>
                      ·
                    </span>
                    <span>{experience}</span>
                  </>
                ) : null}
                <span className="crm-card__dot" aria-hidden>
                  ·
                </span>
                <span>{when}</span>
              </p>

              <div className="crm-card__contacts">
                {doc.phone ? (
                  <a className="crm-card__phone" href={`tel:${doc.phone}`}>
                    {doc.phone}
                  </a>
                ) : (
                  <span className="crm-card__muted">Телефон не указан</span>
                )}
                {takenBy ? (
                  <span className="crm-card__assignee">Ведёт: {takenBy}</span>
                ) : null}
              </div>

              {!taken ? (
                confirmId === id ? (
                  <div className="crm-card__confirm">
                    <p className="crm-card__confirm-text">
                      Взять заявку «{doc.name || "без имени"}» себе? Другие менеджеры её больше не
                      увидят как свободную.
                    </p>
                    <div className="crm-card__confirm-actions">
                      <button
                        className="crm-card__action"
                        disabled={busyId === id}
                        onClick={() => void claim(doc.id)}
                        type="button"
                      >
                        {busyId === id ? "Берём…" : "Да, взять"}
                      </button>
                      <button
                        className="crm-card__cancel"
                        disabled={busyId === id}
                        onClick={() => setConfirmId(null)}
                        type="button"
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="crm-card__action"
                    disabled={busyId === id}
                    onClick={() => setConfirmId(id)}
                    type="button"
                  >
                    Взять себе
                  </button>
                )
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
