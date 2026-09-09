"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Link } from "@payloadcms/ui";
import { ROUTES, SITE } from "@/data/site";

type CertDoc = {
  id: string | number;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  slug: string;
  routeTitle: string;
  routeSlug: string;
  status: string;
  validUntil?: string | null;
  createdAt?: string;
  url: string;
};

const STATUS_LABEL: Record<string, string> = {
  active: "Активен",
  redeemed: "Использован",
  cancelled: "Отменён",
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function GiftCertificatesView() {
  const [docs, setDocs] = useState<CertDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [routeSlug, setRouteSlug] = useState(ROUTES[0]?.slug || "");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState("");
  const [createdUrl, setCreatedUrl] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/gift-certificates", { credentials: "include" });
      const data = (await res.json()) as { ok?: boolean; docs?: CertDoc[]; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "Ошибка загрузки");
      setDocs(data.docs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setOk("");
    setCreatedUrl("");
    try {
      const res = await fetch("/api/admin/gift-certificates", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          routeSlug,
          notes: notes.trim() || undefined,
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        url?: string;
        error?: string;
      };
      if (!res.ok || !data.ok || !data.url) {
        throw new Error(data.error || "Не удалось создать");
      }
      setOk("Сертификат создан.");
      setCreatedUrl(data.url);
      setFirstName("");
      setLastName("");
      setNotes("");
      setCreating(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="admin-gift-certs">
      <div className="admin-cal__back">
        <Link href="/admin" prefetch={false}>
          ← Назад в CRM
        </Link>
        <span className="admin-cal__back-sep" aria-hidden>
          /
        </span>
        <Link href="/admin/leads/new" prefetch={false}>
          Новая заявка
        </Link>
      </div>

      <header className="admin-gift-certs__header">
        <div>
          <p className="admin-cal__eyebrow">CRM</p>
          <h1 className="admin-cal__title">Подарочный сертификат</h1>
          <p className="admin-cal__lead">
            Именные сертификаты с уникальной ссылкой и логотипом Вольницы. Выберите маршрут при
            создании.
          </p>
        </div>
        <button
          type="button"
          className="admin-cal__btn admin-cal__btn--primary"
          onClick={() => {
            setCreating((v) => !v);
            setError("");
            setOk("");
          }}
        >
          {creating ? "Закрыть форму" : "Создать"}
        </button>
      </header>

      {ok ? (
        <p className="admin-gift-certs__ok" role="status">
          {ok}{" "}
          {createdUrl ? (
            <a href={createdUrl} target="_blank" rel="noreferrer">
              Открыть страницу →
            </a>
          ) : null}
        </p>
      ) : null}
      {error ? (
        <p className="admin-gift-certs__error" role="alert">
          {error}
        </p>
      ) : null}

      {creating ? (
        <form className="admin-new-lead__form admin-gift-certs__form" onSubmit={(e) => void onCreate(e)}>
          <div className="admin-new-lead__fields">
            <label className="admin-new-lead__field">
              <span>Имя</span>
              <input
                className="admin-cal__input"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                minLength={2}
                autoComplete="given-name"
              />
            </label>
            <label className="admin-new-lead__field">
              <span>Фамилия</span>
              <input
                className="admin-cal__input"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                minLength={2}
                autoComplete="family-name"
              />
            </label>
            <label className="admin-new-lead__field">
              <span>Маршрут</span>
              <select
                className="admin-cal__input"
                value={routeSlug}
                onChange={(e) => setRouteSlug(e.target.value)}
                required
              >
                {ROUTES.map((r) => (
                  <option key={r.id} value={r.slug}>
                    {r.title} · {r.price.toLocaleString("ru-RU")} ₽
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-new-lead__field admin-new-lead__field--wide">
              <span>Заметки</span>
              <textarea
                className="admin-cal__input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </label>
          </div>
          <div className="admin-new-lead__actions">
            <button type="submit" className="admin-cal__btn admin-cal__btn--primary" disabled={saving}>
              {saving ? "Создание…" : "Создать сертификат"}
            </button>
          </div>
        </form>
      ) : null}

      {loading ? (
        <p className="admin-cal__lead">Загрузка…</p>
      ) : docs.length === 0 ? (
        <p className="admin-cal__lead">Пока нет сертификатов. Нажмите «Создать».</p>
      ) : (
        <div className="admin-gift-certs__grid">
          {docs.map((doc) => (
            <article key={doc.id} className="admin-gift-certs__card">
              <div className="admin-gift-certs__card-top">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={SITE.logoMark} alt="" width={36} height={36} className="admin-gift-certs__logo" />
                <span className={`admin-gift-certs__status admin-gift-certs__status--${doc.status}`}>
                  {STATUS_LABEL[doc.status] || doc.status}
                </span>
              </div>
              <h2 className="admin-gift-certs__name">{doc.fullName || `${doc.firstName} ${doc.lastName}`}</h2>
              <p className="admin-gift-certs__route">{doc.routeTitle}</p>
              <p className="admin-gift-certs__meta">До {formatDate(doc.validUntil)}</p>
              <p className="admin-gift-certs__meta">Создан {formatDate(doc.createdAt)}</p>
              <div className="admin-gift-certs__card-actions">
                <a
                  className="admin-cal__btn admin-cal__btn--primary"
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Открыть
                </a>
                <button
                  type="button"
                  className="admin-cal__btn"
                  onClick={() => {
                    const full = `${origin}${doc.url}`;
                    void navigator.clipboard?.writeText(full);
                  }}
                >
                  Копировать ссылку
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default GiftCertificatesView;
