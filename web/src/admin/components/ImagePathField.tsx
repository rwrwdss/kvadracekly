"use client";

import React, { useState } from "react";
import { useField } from "@payloadcms/ui";
import type { TextFieldClientComponent } from "payload";

/**
 * Поле пути к картинке в Payload-форме: крупное превью, путь вторичен.
 * Подключается как admin.components.Field у text-полей imageUrl.
 */
export const ImagePathField: TextFieldClientComponent = ({ field, path, readOnly }) => {
  const { value, setValue } = useField<string>({ path });
  const [broken, setBroken] = useState(false);
  const src = typeof value === "string" ? value.trim() : "";
  const inputId = `field-${path.replace(/\./g, "__")}`;
  const label =
    typeof field?.label === "string"
      ? field.label
      : field?.label && typeof field.label === "object"
        ? String((field.label as { ru?: string }).ru || "Картинка")
        : "Картинка фона";
  const description =
    typeof field?.admin?.description === "string" ? field.admin.description : "";

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
            !src || broken ? "admin-image-thumb--empty" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {src && !broken ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt=""
              onError={() => setBroken(true)}
            />
          ) : (
            <span>{src ? "Не найдена" : "Нет фото"}</span>
          )}
        </div>
      </div>
      <label className="admin-image-path-field__path-label" htmlFor={inputId}>
        Путь к файлу
      </label>
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
      {description ? <div className="field-description">{description}</div> : null}
    </div>
  );
};
