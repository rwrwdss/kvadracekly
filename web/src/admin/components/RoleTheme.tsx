"use client";

import React, { useEffect } from "react";
import { useAuth } from "@payloadcms/ui";

/**
 * Вешает data-crm-role и для менеджера принудительно светлую тему
 * (иначе тёмный текст-токен на бежевом фоне даёт «белый на белом»).
 */
export function RoleTheme({ children }: { children?: React.ReactNode }) {
  const { user } = useAuth();
  const role =
    user && typeof user === "object" && "role" in user
      ? String((user as { role?: string }).role || "manager")
      : "guest";

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-crm-role", role);
    document.body.classList.toggle("crm-manager", role === "manager");
    document.body.classList.toggle("crm-admin", role === "admin");

    if (role === "manager") {
      root.setAttribute("data-theme", "light");
      try {
        const prefix = "payload";
        document.cookie = `${prefix}-theme=light; path=/; max-age=31536000`;
      } catch {
        /* ignore */
      }
    }

    return () => {
      root.removeAttribute("data-crm-role");
      document.body.classList.remove("crm-manager", "crm-admin");
    };
  }, [role]);

  return children;
}
