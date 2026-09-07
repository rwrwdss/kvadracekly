"use client";

import React from "react";
import { Link } from "@payloadcms/ui";

/**
 * Единый вход в раздел «Главная» — без дубля с группой коллекций Payload.
 * Коллекция gallery скрыта из авто-меню (admin.hidden) и открывается отсюда.
 */
export function HomeNav() {
  return (
    <div className="admin-cal-nav">
      <p className="admin-cal-nav__label">Главная</p>
      <Link className="nav__link" href="/admin/home" prefetch={false}>
        Тексты первого экрана
      </Link>
      <Link className="nav__link" href="/admin/collections/gallery" prefetch={false}>
        Фото для карусели
      </Link>
    </div>
  );
}
