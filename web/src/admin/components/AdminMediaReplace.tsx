"use client";

import React, { useId, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";

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

const MAX_BYTES = 200 * 1024 * 1024;
/** Выше этого — только client upload в Blob (лимит body Vercel ~4.5MB). */
const SERVER_UPLOAD_MAX = 3.5 * 1024 * 1024;

const VIDEO_EXT = /\.(mp4|webm|mov)$/i;
const HERO_SAFE_VIDEO = /\.(mp4|webm)$/i;

export function isVideoFile(file: File): boolean {
  const t = (file.type || "").toLowerCase();
  return t.startsWith("video/") || VIDEO_EXT.test(file.name);
}

export async function uploadMediaFile(
  file: File,
  alt: string,
): Promise<{ id: number | string; url: string }> {
  if (file.size > MAX_BYTES) {
    throw new Error("Файл больше 200 МБ — сожмите видео или выберите файл поменьше");
  }

  const isVideo = isVideoFile(file);
  if (isVideo && !HERO_SAFE_VIDEO.test(file.name) && !/mp4|webm/i.test(file.type)) {
    throw new Error(
      "Для сайта нужен MP4 (H.264) или WebM. MOV с iPhone в Chrome часто не играет — экспортируйте в MP4.",
    );
  }

  const useClientBlob = isVideo || file.size > SERVER_UPLOAD_MAX;

  if (useClientBlob) {
    // Кириллица в имени → латиница/подчёркивания (иначе Blob pathname кривой)
    const ext = (file.name.match(/\.[a-z0-9]+$/i)?.[0] || (isVideo ? ".mp4" : "")).toLowerCase();
    const base = file.name
      .replace(/\.[^.]+$/, "")
      .replace(/[^\w\-()+]+/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "")
      .slice(0, 80);
    const pathname = `media/${Date.now()}-${base || "upload"}${ext}`;
    const blob = await upload(pathname, file, {
      access: "public",
      handleUploadUrl: "/api/admin/blob-client-upload",
      multipart: file.size > 8 * 1024 * 1024,
      contentType: file.type || (isVideo ? "video/mp4" : undefined),
    });
    if (!blob.url) throw new Error("Blob не вернул URL");
    return { id: blob.pathname || blob.url, url: blob.url };
  }

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
  if (res.status === 413) {
    throw new Error("Файл слишком большой для сервера — попробуйте ещё раз (загрузка через Blob)");
  }
  if (!res.ok || !data.id || !data.url) {
    throw new Error(data.error || "Не удалось загрузить файл");
  }
  return { id: data.id, url: data.url };
}

export function isVideoUrl(src: string): boolean {
  return /\.(mp4|webm|mov)(\?|$)/i.test(src) || /blob\.vercel-storage\.com/i.test(src);
}

/** Поле превью + «Заменить» (upload) + запасной путь. */
export function AdminImagePathInput({
  label,
  value,
  onChange,
  hint,
  /** video: без accept в Finder — иначе на macOS .mp4 часто серый */
  kind = "image",
  replaceLabel,
  altForUpload,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  hint?: string;
  kind?: "image" | "video";
  replaceLabel?: string;
  altForUpload?: string;
}) {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const src = String(value || "").trim();
  const expectVideo = kind === "video";
  const video = Boolean(src && (expectVideo || isVideoUrl(src)));
  const buttonLabel =
    replaceLabel || (expectVideo ? "Заменить видео" : "Заменить фотографию");
  const uploadAlt = altForUpload || (expectVideo ? "Видео фона" : "Фото");

  async function onFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      if (expectVideo && !isVideoFile(file)) {
        throw new Error("Выберите видеофайл MP4 или WebM (Квадроциклы.mp4 и т.п.)");
      }
      if (!expectVideo && isVideoFile(file)) {
        throw new Error("Сейчас режим «Фото». Переключите на «Видео», затем загрузите MP4.");
      }
      const { url } = await uploadMediaFile(file, uploadAlt);
      onChange(url);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Ошибка загрузки";
      if (/too large|request entity|413|payload/i.test(msg)) {
        setError("Файл слишком большой для прямой загрузки. Обновите страницу и попробуйте снова.");
      } else {
        setError(msg);
      }
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
          {uploading
            ? expectVideo
              ? "Загрузка видео…"
              : "Загрузка…"
            : buttonLabel}
        </button>
        {/* Для видео НЕ ставим accept — на macOS иначе .mp4 часто неактивен */}
        <input
          ref={fileRef}
          id={inputId}
          type="file"
          {...(expectVideo ? {} : { accept: "image/*,.jpg,.jpeg,.png,.webp,.gif,.avif" })}
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
