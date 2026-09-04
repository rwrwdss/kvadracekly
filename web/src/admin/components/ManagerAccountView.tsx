import type { AdminViewServerProps } from "payload";
import { AccountView } from "@payloadcms/next/views";
import { Gutter } from "@payloadcms/ui";
import React from "react";
import { ManagerAccountClient } from "./ManagerAccountClient";

/**
 * Для менеджера — только данные аккаунта и выход.
 * Для админа — стандартный Account Payload.
 * Без DefaultTemplate: оболочка admin уже даёт layout/nav.
 */
export async function ManagerAccountView(props: AdminViewServerProps) {
  const user = props.initPageResult.req.user as
    | { role?: string; name?: string | null; email?: string }
    | null
    | undefined;

  if (user?.role !== "manager") {
    return AccountView(props);
  }

  return (
    <Gutter className="crm-account">
      <ManagerAccountClient
        email={String(user.email || "")}
        name={String(user.name || "Менеджер")}
      />
    </Gutter>
  );
}
