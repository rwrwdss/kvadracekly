"use client";

import React from "react";
import { Link } from "@payloadcms/ui";

/**
 * Тексты героя — отдельный экран.
 * CRUD фото галереи в админке отключён.
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
