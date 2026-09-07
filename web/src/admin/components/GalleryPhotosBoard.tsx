"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Link } from "@payloadcms/ui";

type MediaLike = {
  url?: string | null;
  thumbnailURL?: string | null;
  alt?: string | null;
  sizes?: {
    thumb?: { url?: string | null } | null;
    card?: { url?: string | null } | null;
  } | null;
};

export type GalleryDoc = {
  id: number | string;
  title?: string | null;
  published?: boolean | null;
  sortOrder?: number | null;
  category?: string | null;
  image?: MediaLike | number | string | null;
};

export function mediaSrc(value: unknown): string | null {
  if (!value || typeof value === "number" || typeof value === "string") return null;
  const doc = value as MediaLike;
  return (
    doc.sizes?.thumb?.url ||
    doc.thumbnailURL ||
    doc.sizes?.card?.url ||
    doc.url ||
    null
  );
}

const CATEGORY_LABELS: Record<string, string> = {
  atv: "Квадроциклы",
  routes: "Маршруты",
  nature: "Природа",
  night: "Ночные",
  manor: "Усадьба",
};

export function useGalleryDocs(limit = 50) {
  const [docs, setDocs] = useState<GalleryDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/gallery?depth=1&limit=${limit}&sort=sortOrder`, {
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.errors?.[0]?.message || data?.message || "Не удалось загрузить фото");
      }
      setDocs(Array.isArray(data.docs) ? data.docs : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
      setDocs([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    void load();
  }, [load]);

  return { docs, loading, error, reload: load };
}

type GridProps = {
  docs: GalleryDoc[];
  emptyText?: string;
};

/** Сетка превью — по карточке на каждое фото. */
export function GalleryThumbsGrid({ docs, emptyText }: GridProps) {
  if (!docs.length) {
    return (
      <p className="gallery-photos-board__empty">
        {emptyText ||
          "Пока нет фото. Нажмите «Создать» / «Добавить фото», загрузите картинку и сохраните."}
      </p>
    );
  }

  return (
    <div className="gallery-photos-board__grid">
      {docs.map((doc) => {
        const src = mediaSrc(doc.image);
        const href = `/admin/collections/gallery/${encodeURIComponent(String(doc.id))}`;
        const cat = CATEGORY_LABELS[String(doc.category || "")] || doc.category || "";
        return (
          <Link key={String(doc.id)} className="gallery-photos-board__card" href={href} prefetch={false}>
            <span className="gallery-photos-board__thumb">
              {src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt={doc.title || "Фото"} />
              ) : (
                <span className="gallery-photos-board__no-img">Нет файла</span>
              )}
            </span>
            <span className="gallery-photos-board__meta">
              <span className="gallery-photos-board__name">{doc.title || "Без названия"}</span>
              <span className="gallery-photos-board__sub">
                {cat}
                {doc.published === false ? " · скрыто" : ""}
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}

/** Компактная полоса превью для панели текстов главной. */
export function GalleryThumbsStrip() {
  const { docs, loading, error, reload } = useGalleryDocs(24);

  return (
    <div className="gallery-thumbs-strip">
      <div className="gallery-thumbs-strip__head">
        <p className="gallery-thumbs-strip__title">Фото карусели — превью каждого кадра</p>
        <div className="gallery-thumbs-strip__actions">
          <button type="button" className="gallery-photos-board__btn gallery-photos-board__btn--ghost" onClick={() => void reload()}>
            Обновить
          </button>
          <Link className="gallery-photos-board__btn" href="/admin/collections/gallery/create" prefetch={false}>
            + Добавить
          </Link>
        </div>
      </div>
      {loading ? <p className="gallery-photos-board__mute">Загружаем превью…</p> : null}
      {error ? <p className="gallery-photos-board__error">{error}</p> : null}
      {!loading && !error ? <GalleryThumbsGrid docs={docs} /> : null}
      <p className="catalog-layout-panel__hint">
        Полный список и загрузка —{" "}
        <Link href="/admin/collections/gallery" prefetch={false}>
          Фото для карусели
        </Link>
        .
      </p>
    </div>
  );
}

/** Сетка превью фото на странице коллекции «Галерея». */
export function GalleryPhotosBoard() {
  const { docs, loading, error, reload } = useGalleryDocs(50);

  return (
    <section className="gallery-photos-board">
      <div className="gallery-photos-board__head">
        <div>
          <p className="gallery-photos-board__eyebrow">Карусель на сайте</p>
          <h2 className="gallery-photos-board__title">Превью каждого фото</h2>
          <p className="gallery-photos-board__lead">
            У каждого кадра — своя миниатюра. Тексты первого экрана — только в{" "}
            <Link href="/admin/home" prefetch={false}>
              Тексты первого экрана
            </Link>
            (здесь не дублируем).
          </p>
        </div>
        <div className="gallery-photos-board__actions">
          <Link className="gallery-photos-board__btn" href="/admin/collections/gallery/create" prefetch={false}>
            + Добавить фото
          </Link>
          <button type="button" className="gallery-photos-board__btn gallery-photos-board__btn--ghost" onClick={() => void reload()}>
            Обновить
          </button>
        </div>
      </div>

      {loading ? <p className="gallery-photos-board__mute">Загружаем превью…</p> : null}
      {error ? <p className="gallery-photos-board__error">{error}</p> : null}
      {!loading && !error ? <GalleryThumbsGrid docs={docs} /> : null}
    </section>
  );
}
