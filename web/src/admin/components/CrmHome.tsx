"use client";

import React from "react";
import { Link, useAuth } from "@payloadcms/ui";

const TILES = [
  {
    href: "/admin/collections/leads",
    title: "Заявки",
    hint: "Очередь записей и статусы",
  },
  {
    href: "/admin/collections/customers",
    title: "Клиенты",
    hint: "Телефоны и прогресс маршрутов",
  },
  {
    href: "/admin/collections/notifications",
    title: "Уведомления",
    hint: "Что ушло в Telegram / почту",
  },
] as const;

export function CrmHome() {
  const { user } = useAuth();
  const name =
    user && typeof user === "object" && "name" in user && (user as { name?: string }).name
      ? String((user as { name?: string }).name)
      : "Менеджер";
  const role =
    user && typeof user === "object" && "role" in user
      ? String((user as { role?: string }).role || "")
      : "";
  const isManager = role === "manager";

  return (
    <section className="crm-home">
      <div className="crm-home__intro">
        <p className="crm-home__eyebrow">Вольница · CRM</p>
        <h1 className="crm-home__title">Здравствуйте, {name}</h1>
        <p className="crm-home__lead">
          {isManager
            ? "Только заявки, клиенты и уведомления — без лишнего."
            : "Быстрый вход в CRM. Полный CMS — в меню слева."}
        </p>
      </div>

      <div className="crm-home__tiles">
        {TILES.map((tile) => (
          <Link className="crm-home__tile" href={tile.href} key={tile.href}>
            <span className="crm-home__tile-title">{tile.title}</span>
            <span className="crm-home__tile-hint">{tile.hint}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
