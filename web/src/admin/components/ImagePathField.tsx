"use client";

import React, { useState } from "react";
import { useField } from "@payloadcms/ui";
import type { TextFieldClientComponent } from "payload";

/**
 * Поле пути к картинке в Payload-форме с миниатюрой превью.
 * Подключается как admin.components.Field у text-полей imageUrl.
 */
export const ImagePathField: TextFieldClientComponent = ({ field, path, readOnly }) => {
  const { value, setValue } = useField<string>({ path });
  const [broken, setBroken] = useState(false);
  const src = typeof value === "string" ? value.trim() : "";
  const label =
    typeof field?.label === "string"
      ? field.label
      : field?.label && typeof field.label === "object"
        ? String((field.label as { ru?: string }).ru || "Картинка")
        : "Картинка фона";
  const description =
    typeof field?.admin?.description === "string" ? field.admin.description : "";

  return (
    <div className="field-type text admin-image-path-field">
      <label className="field-label" htmlFor={`field-${path.replace(/\./g, "__")}`}>
        {label}
      </label>
      <div className="admin-image-path-field__row">
        <input
          id={`field-${path.replace(/\./g, "__")}`}
          value={src}
          readOnly={Boolean(readOnly)}
          onChange={(e) => {
            setBroken(false);
            setValue(e.target.value);
          }}
        />
        <div
          className={[
            "admin-image-thumb",
            !src || broken ? "admin-image-thumb--empty" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {src && !broken ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="" onError={() => setBroken(true)} />
          ) : (
            <span>{src ? "Не найдена" : "Нет фото"}</span>
          )}
        </div>
      </div>
      {description ? <div className="field-description">{description}</div> : null}
    </div>
  );
};
