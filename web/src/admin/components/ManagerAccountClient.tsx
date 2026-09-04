"use client";

import React from "react";
import { Link } from "@payloadcms/ui";

export function ManagerAccountClient({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  return (
    <section className="crm-account__card">
      <p className="crm-account__eyebrow">Вольница · CRM</p>
      <h1 className="crm-account__title">Аккаунт</h1>
      <p className="crm-account__lead">Профиль менеджера. Редактирование данных недоступно.</p>

      <dl className="crm-account__meta">
        <div>
          <dt>Имя</dt>
          <dd>{name}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>{email}</dd>
        </div>
        <div>
          <dt>Роль</dt>
          <dd>Менеджер CRM</dd>
        </div>
      </dl>

      <Link className="crm-account__logout" href="/admin/logout" prefetch={false}>
        Выйти
      </Link>
    </section>
  );
}
