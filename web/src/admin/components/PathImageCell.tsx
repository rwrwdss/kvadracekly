"use client";

import React from "react";

type Props = {
  cellData?: string | null;
  rowData?: { imageUrl?: string | null; imageAlt?: string | null; title?: string | null; name?: string | null };
};

/** Превью картинки по пути (тарифы / техника) в таблице списка. */
export function PathImageCell({ cellData, rowData }: Props) {
  const src = String(cellData || rowData?.imageUrl || "").trim();
  const alt = String(rowData?.imageAlt || rowData?.title || rowData?.name || "Превью");

  if (!src) {
    return <span className="gallery-image-cell gallery-image-cell--empty">Нет фото</span>;
  }

  return (
    <span className="gallery-image-cell">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} />
    </span>
  );
}
