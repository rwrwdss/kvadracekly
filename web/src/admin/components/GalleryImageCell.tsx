"use client";

import React from "react";

type MediaLike = {
  url?: string | null;
  thumbnailURL?: string | null;
  alt?: string | null;
  filename?: string | null;
  sizes?: {
    thumb?: { url?: string | null } | null;
    card?: { url?: string | null } | null;
  } | null;
};

type Props = {
  cellData?: MediaLike | number | string | null;
  rowData?: { title?: string | null; image?: MediaLike | number | string | null };
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

/** Миниатюра фото в списке «Галерея». */
export function GalleryImageCell({ cellData, rowData }: Props) {
  const src = mediaSrc(cellData) || mediaSrc(rowData?.image);
  const alt =
    (typeof cellData === "object" && cellData && "alt" in cellData && cellData.alt) ||
    rowData?.title ||
    "Фото";

  if (!src) {
    return <span className="gallery-image-cell gallery-image-cell--empty">Нет фото</span>;
  }

  return (
    <span className="gallery-image-cell">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={String(alt)} />
    </span>
  );
}
