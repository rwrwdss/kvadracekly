"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Link } from "@payloadcms/ui";

type TariffDoc = {
  id: number | string;
  title?: string | null;
  badge?: string | null;
  price?: number | null;
  priceNote?: string | null;
  duration?: string | null;
  distance?: string | null;
  difficultyLabel?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  published?: boolean | null;
  sortOrder?: number | null;
  season?: string | null;
};

type FleetDoc = {
  id: number | string;
  name?: string | null;
  role?: string | null;
  color?: string | null;
  count?: number | null;
  seats?: number | null;
  drive?: string | null;
  imageUrl?: string | null;
  published?: boolean | null;
  sortOrder?: number | null;
  season?: string | null;
};

function money(n?: number | null): string {
  if (n == null || Number.isNaN(Number(n))) return "—";
  return `${new Intl.NumberFormat("ru-RU").format(Number(n))} ₽`;
}

function seasonLabel(v?: string | null): string {
  if (v === "snow") return "Снегоходы";
  if (v === "all") return "Всегда";
  if (v === "future") return "Будущий";
  if (v === "off") return "Выкл";
  return "Квадро";
}

function Thumb({ src, alt }: { src?: string | null; alt: string }) {
  const url = String(src || "").trim();
  if (!url) return <span className="catalog-card__thumb catalog-card__thumb--empty">Нет фото</span>;
  return (
    <span className="catalog-card__thumb">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={alt} />
    </span>
  );
}

function TariffsCards() {
  const [docs, setDocs] = useState<TariffDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/tariffs?depth=0&limit=50&sort=sortOrder", {
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.errors?.[0]?.message || "Не удалось загрузить тарифы");
      setDocs(data.docs || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="catalog-items-board">
      <div className="catalog-items-board__head">
        <div>
          <h3 className="catalog-items-board__title">Карточки тарифов</h3>
          <p className="catalog-items-board__lead">
            Нажмите «Изменить», чтобы править название, цену, описание и фото.
          </p>
        </div>
        <div className="catalog-items-board__actions">
          <button type="button" className="catalog-items-board__btn catalog-items-board__btn--ghost" onClick={() => void load()}>
            Обновить
          </button>
          <Link className="catalog-items-board__btn" href="/admin/collections/tariffs/create" prefetch={false}>
            + Новый тариф
          </Link>
        </div>
      </div>

      {loading ? <p className="catalog-items-board__mute">Загрузка…</p> : null}
      {error ? <p className="catalog-items-board__error">{error}</p> : null}

      <div className="catalog-items-board__grid">
        {docs.map((doc) => (
          <article
            key={String(doc.id)}
            className={`catalog-card${doc.published === false ? " catalog-card--off" : ""}`}
          >
            <Thumb src={doc.imageUrl} alt={doc.title || "Тариф"} />
            <div className="catalog-card__body">
              <div className="catalog-card__top">
                <h4 className="catalog-card__name">{doc.title || "Без названия"}</h4>
                {doc.badge ? <span className="catalog-card__badge">{doc.badge}</span> : null}
              </div>
              <p className="catalog-card__price">{money(doc.price)}</p>
              <ul className="catalog-card__facts">
                <li>{doc.duration || "—"}</li>
                <li>{doc.distance || "—"}</li>
                <li>{doc.difficultyLabel || "—"}</li>
                <li>{seasonLabel(doc.season)}</li>
              </ul>
              {doc.description ? (
                <p className="catalog-card__desc">{doc.description}</p>
              ) : null}
              <div className="catalog-card__foot">
                <span className="catalog-card__status">
                  {doc.published === false ? "Скрыт" : "На сайте"} · порядок {doc.sortOrder ?? 0}
                </span>
                <Link
                  className="catalog-card__edit"
                  href={`/admin/collections/tariffs/${encodeURIComponent(String(doc.id))}`}
                  prefetch={false}
                >
                  Изменить →
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      {!loading && !docs.length ? (
        <p className="catalog-items-board__mute">Пока нет тарифов. Создайте первый.</p>
      ) : null}
    </section>
  );
}

function FleetCards() {
  const [docs, setDocs] = useState<FleetDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/fleet?depth=0&limit=50&sort=sortOrder", {
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.errors?.[0]?.message || "Не удалось загрузить технику");
      setDocs(data.docs || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="catalog-items-board">
      <div className="catalog-items-board__head">
        <div>
          <h3 className="catalog-items-board__title">Карточки техники</h3>
          <p className="catalog-items-board__lead">
            Нажмите «Изменить», чтобы править название, роль, количество и фото.
          </p>
        </div>
        <div className="catalog-items-board__actions">
          <button type="button" className="catalog-items-board__btn catalog-items-board__btn--ghost" onClick={() => void load()}>
            Обновить
          </button>
          <Link className="catalog-items-board__btn" href="/admin/collections/fleet/create" prefetch={false}>
            + Новая техника
          </Link>
        </div>
      </div>

      {loading ? <p className="catalog-items-board__mute">Загрузка…</p> : null}
      {error ? <p className="catalog-items-board__error">{error}</p> : null}

      <div className="catalog-items-board__grid">
        {docs.map((doc) => (
          <article
            key={String(doc.id)}
            className={`catalog-card${doc.published === false ? " catalog-card--off" : ""}`}
          >
            <Thumb src={doc.imageUrl} alt={doc.name || "Техника"} />
            <div className="catalog-card__body">
              <div className="catalog-card__top">
                <h4 className="catalog-card__name">{doc.name || "Без названия"}</h4>
                {doc.role ? <span className="catalog-card__badge">{doc.role}</span> : null}
              </div>
              <ul className="catalog-card__facts">
                <li>{doc.color || "—"}</li>
                <li>×{doc.count ?? 1} шт</li>
                <li>{doc.seats ?? 2} мест</li>
                <li>{doc.drive || "4×4"}</li>
                <li>{seasonLabel(doc.season)}</li>
              </ul>
              <div className="catalog-card__foot">
                <span className="catalog-card__status">
                  {doc.published === false ? "Скрыт" : "На сайте"} · порядок {doc.sortOrder ?? 0}
                </span>
                <Link
                  className="catalog-card__edit"
                  href={`/admin/collections/fleet/${encodeURIComponent(String(doc.id))}`}
                  prefetch={false}
                >
                  Изменить →
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      {!loading && !docs.length ? (
        <p className="catalog-items-board__mute">Пока нет техники. Создайте первую.</p>
      ) : null}
    </section>
  );
}

export function TariffsItemsBoard() {
  return <TariffsCards />;
}

export function FleetItemsBoard() {
  return <FleetCards />;
}
