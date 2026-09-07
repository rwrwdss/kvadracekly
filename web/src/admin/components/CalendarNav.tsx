"use client";

import React from "react";
import { Link } from "@payloadcms/ui";

export function CalendarNav() {
  return (
    <div className="admin-cal-nav">
      <p className="admin-cal-nav__label">Календарь</p>
      <Link className="nav__link" href="/admin" prefetch={false}>
        ← В CRM
      </Link>
      <Link className="nav__link" href="/admin/calendar" prefetch={false}>
        Записи
      </Link>
      <Link className="nav__link" href="/admin/calendar/stops" prefetch={false}>
        Остановка
      </Link>
    </div>
  );
}
