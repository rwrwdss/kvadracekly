"use client";

import React, { useId, useRef, useState } from "react";

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

export async function uploadMediaFile(
  file: File,
  alt: string,
): Promise<{ id: number | string; url: string }> {
  const body = new FormData();
  body.append("file", file);
  body.append("alt", alt);
  const res = await fetch("/api/admin/media-upload", {
    method: "POST",
    credentials: "include",
    body,
  });
  const data = (await res.json().catch(() => ({}))) as {
    error?: string;
    id?: number | string;
    url?: string | null;
  };
  if (!res.ok || !data.id || !data.url) {
    throw new Error(data.error || "Не удалось загрузить файл");
  }
  return { id: data.id, url: data.url };
}

export function isVideoUrl(src: string): boolean {
  return /\.(mp4|webm)(\?|$)/i.test(src);
}

/** Поле превью + «Заменить» (upload) + запасной путь. */
export function AdminImagePathInput({
  label,
  value,
  onChange,
  hint,
  accept = "image/*",
  replaceLabel = "Заменить фотографию",
  altForUpload = "Фото",
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  hint?: string;
  accept?: string;
  replaceLabel?: string;
  altForUpload?: string;
}) {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const src = String(value || "").trim();
  const expectVideo = accept.includes("video");
  const video = Boolean(src && (expectVideo || isVideoUrl(src)));

  async function onFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const { url } = await uploadMediaFile(file, altForUpload);
      onChange(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="admin-image-path admin-image-path--preview-first">
      <span className="admin-image-path__label">{label}</span>
      <div className="admin-image-path__preview">
        {video ? (
          <div className="admin-image-thumb admin-image-thumb--lg admin-image-thumb--video">
            <video src={src} muted playsInline preload="metadata" />
          </div>
        ) : src ? (
          <AdminImageThumb src={src} alt={label} className="admin-image-thumb--lg" />
        ) : (
          <div
            className="admin-image-thumb admin-image-thumb--lg admin-image-thumb--empty"
            aria-hidden
          >
            {expectVideo ? "Нет видео" : "Нет фото"}
          </div>
        )}
      </div>
      <div className="admin-image-path__actions">
        <button
          type="button"
          className="admin-image-path__replace"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? "Загрузка…" : replaceLabel}
        </button>
        <input
          ref={fileRef}
          id={inputId}
          type="file"
          accept={accept}
          className="admin-image-path__file"
          hidden
          onChange={(e) => void onFile(e.target.files?.[0])}
        />
      </div>
      {error ? (
        <p className="admin-image-path__error" role="alert">
          {error}
        </p>
      ) : null}
      <details className="admin-image-path__details">
        <summary>Путь (запасной)</summary>
        <input
          className="admin-image-path__path"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          autoComplete="off"
        />
        {hint ? <p className="catalog-layout-panel__hint">{hint}</p> : null}
      </details>
    </div>
  );
}
