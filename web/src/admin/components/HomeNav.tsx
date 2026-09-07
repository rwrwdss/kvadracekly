"use client";

import React from "react";
import { Link } from "@payloadcms/ui";

/**
 * Тексты героя — отдельный экран.
 * Фото карусели — коллекция «Фото для карусели» в группе «Главная» (без дубля ссылки).
 */
export function HomeNav() {
  return (
    <div className="admin-cal-nav">
      <p className="admin-cal-nav__label">Главная</p>
      <Link className="nav__link" href="/admin/home" prefetch={false}>
        Тексты первого экрана
      </Link>
    </div>
  );
}
