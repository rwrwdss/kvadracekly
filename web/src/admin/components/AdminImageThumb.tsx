"use client";

import React, { useState } from "react";

/** Миниатюра картинки по пути/URL в админ-формах. */
export function AdminImageThumb({
  src,
  alt = "Превью",
  className = "",
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);
  const url = String(src || "").trim();

  if (!url || broken) {
    return (
      <div
        className={`admin-image-thumb admin-image-thumb--empty ${className}`.trim()}
        aria-hidden
      >
        {url ? "Не найдена" : "Нет фото"}
      </div>
    );
  }

  return (
    <div className={`admin-image-thumb ${className}`.trim()}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={alt} onError={() => setBroken(true)} />
    </div>
  );
}

/** Поле «путь к картинке» + крупное превью для панелей каталога/главной. */
export function AdminImagePathInput({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  hint?: string;
}) {
  return (
    <label className="admin-image-path admin-image-path--preview-first">
      <span className="admin-image-path__label">{label}</span>
      <div className="admin-image-path__preview">
        <AdminImageThumb src={value} alt={label} className="admin-image-thumb--lg" />
      </div>
      <span className="admin-image-path__path-label">Путь к файлу</span>
      <input
        className="admin-image-path__path"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        autoComplete="off"
      />
      {hint ? <p className="catalog-layout-panel__hint">{hint}</p> : null}
    </label>
  );
}
