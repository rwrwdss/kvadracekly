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

type GalleryDoc = {
  id: number | string;
  title?: string | null;
  published?: boolean | null;
  sortOrder?: number | null;
  category?: string | null;
  image?: MediaLike | number | string | null;
};

function mediaSrc(value: unknown): string | null {
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

/** Сетка превью фото над списком «Галерея» — видно сразу, без скролла формы. */
export function GalleryPhotosBoard() {
  const [docs, setDocs] = useState<GalleryDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/gallery?depth=1&limit=50&sort=sortOrder", {
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
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="gallery-photos-board">
      <div className="gallery-photos-board__head">
        <div>
          <p className="gallery-photos-board__eyebrow">Карусель на сайте</p>
          <h2 className="gallery-photos-board__title">Превью загруженных фото</h2>
          <p className="gallery-photos-board__lead">
            Здесь сразу видно кадры. Чтобы добавить — «Создать» сверху. Тексты первого экрана — в{" "}
            <Link href="/admin/home" prefetch={false}>
              Тексты первого экрана
            </Link>
            .
          </p>
        </div>
        <div className="gallery-photos-board__actions">
          <Link className="gallery-photos-board__btn" href="/admin/collections/gallery/create" prefetch={false}>
            + Добавить фото
          </Link>
          <button type="button" className="gallery-photos-board__btn gallery-photos-board__btn--ghost" onClick={() => void load()}>
            Обновить
          </button>
        </div>
      </div>

      {loading ? <p className="gallery-photos-board__mute">Загружаем превью…</p> : null}
      {error ? <p className="gallery-photos-board__error">{error}</p> : null}

      {!loading && !error && docs.length === 0 ? (
        <p className="gallery-photos-board__empty">
          Пока нет фото. Нажмите «Создать», загрузите картинку и сохраните — тогда здесь появятся
          превью.
        </p>
      ) : null}

      {docs.length > 0 ? (
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
      ) : null}
    </section>
  );
}

/** @deprecated — оставлено для совместимости importMap; используйте GalleryPhotosBoard */
export function GalleryHomePanel() {
  return <GalleryPhotosBoard />;
}
