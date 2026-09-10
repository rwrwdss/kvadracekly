"use client";

import React, { useRef, useState } from "react";
import { useField } from "@payloadcms/ui";
import type { TextFieldClientComponent } from "payload";
import { isVideoUrl, uploadMediaFile } from "./AdminMediaReplace";

/**
 * Поле пути к картинке/видео: превью + «Заменить» + запасной путь.
 * Подключается как admin.components.Field у text-полей imageUrl / heroVideoUrl.
 */
export const ImagePathField: TextFieldClientComponent = ({ field, path, readOnly }) => {
  const { value, setValue } = useField<string>({ path });
  const [broken, setBroken] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const src = typeof value === "string" ? value.trim() : "";
  const inputId = `field-${path.replace(/\./g, "__")}`;
  const label =
    typeof field?.label === "string"
      ? field.label
      : field?.label && typeof field.label === "object"
        ? String((field.label as { ru?: string }).ru || "Медиа")
        : "Картинка фона";
  const description =
    typeof field?.admin?.description === "string" ? field.admin.description : "";

  const isVideoField =
    path.includes("heroVideo") ||
    path.includes("videoUrl") ||
    Boolean(description.toLowerCase().includes("видео"));
  const accept = isVideoField ? "video/mp4,video/webm" : "image/*";
  const replaceLabel = isVideoField ? "Заменить видео" : "Заменить фотографию";
  const video = Boolean(src && (isVideoField || isVideoUrl(src)));

  async function onFile(file: File | undefined) {
    if (!file || readOnly) return;
    setUploading(true);
    setError("");
    try {
      const { url } = await uploadMediaFile(file, isVideoField ? "Видео фона" : label);
      setBroken(false);
      setValue(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="field-type text admin-image-path-field admin-image-path-field--preview-first">
      <label className="field-label" htmlFor={inputId}>
        {label}
      </label>
      <div className="admin-image-path-field__preview">
        <div
          className={[
            "admin-image-thumb",
            "admin-image-thumb--lg",
            video ? "admin-image-thumb--video" : "",
            !src || broken ? "admin-image-thumb--empty" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {src && !broken ? (
            video ? (
              <video src={src} muted playsInline preload="metadata" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt="" onError={() => setBroken(true)} />
            )
          ) : (
            <span>{src ? "Не найдена" : isVideoField ? "Нет видео" : "Нет фото"}</span>
          )}
        </div>
      </div>
      <div className="admin-image-path__actions">
        <button
          type="button"
          className="admin-image-path__replace"
          disabled={Boolean(readOnly) || uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? "Загрузка…" : replaceLabel}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept={accept}
          className="admin-image-path__file"
          hidden
          disabled={Boolean(readOnly)}
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
          id={inputId}
          className="admin-image-path-field__path"
          value={src}
          readOnly={Boolean(readOnly)}
          spellCheck={false}
          autoComplete="off"
          onChange={(e) => {
            setBroken(false);
            setValue(e.target.value);
          }}
        />
      </details>
      {description ? <div className="field-description">{description}</div> : null}
    </div>
  );
};
