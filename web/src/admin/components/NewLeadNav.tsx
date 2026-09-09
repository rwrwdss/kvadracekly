"use client";

import React from "react";
import { Link } from "@payloadcms/ui";

function PhoneIcon() {
  return (
    <svg
      className="admin-new-lead-nav__icon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.2 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C11.4 21 3 12.6 3 2c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Ссылка в конце сайдбара CRM — ручная заявка для админов и менеджеров. */
export function NewLeadNav() {
  return (
    <div className="admin-new-lead-nav">
      <Link className="admin-new-lead-nav__link nav__link" href="/admin/leads/new" prefetch={false}>
        <PhoneIcon />
        Новая заявка
      </Link>
    </div>
  );
}

export default NewLeadNav;
