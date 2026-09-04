"use client";

import React from "react";
import { useAuth, useConfig, useTranslation, Link, LogOutIcon } from "@payloadcms/ui";
import { formatAdminURL } from "payload/shared";

/**
 * В сайдбаре у менеджера кнопку «Выйти» не показываем —
 * выход только со страницы аккаунта.
 */
export function ManagerLogout({ tabIndex = 0 }: { tabIndex?: number }) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { config } = useConfig();

  const role =
    user && typeof user === "object" && "role" in user
      ? String((user as { role?: string }).role || "")
      : "";

  if (role === "manager") return null;

  const {
    admin: {
      routes: { logout: logoutRoute },
    },
    routes: { admin: adminRoute },
  } = config;

  return (
    <Link
      aria-label={t("authentication:logOut")}
      className="nav__log-out"
      href={formatAdminURL({ adminRoute, path: logoutRoute })}
      prefetch={false}
      tabIndex={tabIndex}
      title={t("authentication:logOut")}
    >
      <LogOutIcon />
    </Link>
  );
}
