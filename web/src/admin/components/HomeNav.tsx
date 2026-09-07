"use client";

import React from "react";
import { Link } from "@payloadcms/ui";

/** Ссылки раздела «Главная» в боковом меню админки. */
export function HomeNav() {
  return (
    <div className="admin-cal-nav">
      <p className="admin-cal-nav__label">Главная</p>
      <Link className="nav__link" href="/admin/home" prefetch={false}>
        Герой и тексты
      </Link>
      <Link className="nav__link" href="/admin/collections/gallery" prefetch={false}>
        Галерея
      </Link>
    </div>
  );
}
