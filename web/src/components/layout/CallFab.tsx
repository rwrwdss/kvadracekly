"use client";

import { useEffect, useState } from "react";
import { SITE } from "@/data/site";

const TEL = SITE.phone.replace(/[^\d+]/g, "");

/** Плавающая кнопка «позвонить» в правом нижнем углу. */
export function CallFab() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), 120);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <a
      href={`tel:${TEL}`}
      className={`call-fab${ready ? " call-fab--in" : ""}`}
      aria-label={`Позвонить ${SITE.phone}`}
      title={SITE.phone}
    >
      <span className="call-fab__pulse" aria-hidden />
      <PhoneIcon />
    </a>
  );
}

function PhoneIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7.2 3.8c.4-.4 1-.5 1.5-.3l2.2.9c.5.2.8.7.8 1.2v2.1c0 .4-.2.8-.5 1-.7.5-1.1 1.2-1.2 2 .2 1.6 1.1 3.1 2.4 4.3 1.2 1.2 2.7 2.1 4.3 2.4.8-.1 1.5-.5 2-1.2.2-.3.6-.5 1-.5h2.1c.5 0 1 .3 1.2.8l.9 2.2c.2.5.1 1.1-.3 1.5l-1.1 1.1c-.4.4-1 .6-1.5.6C11.6 21.8 2.2 12.4 3.1 3.6c0-.5.2-1.1.6-1.5l1.1-1.1Z"
        fill="currentColor"
      />
    </svg>
  );
}
