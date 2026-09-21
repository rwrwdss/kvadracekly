"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SITE } from "@/data/site";

const STORAGE_KEY = "volnitsa_pdn_cookies_consent";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === "1") return;
    } catch {
      /* private mode */
    }
    setVisible(true);
  }, []);

  function accept() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
    window.dispatchEvent(new Event("volnitsa:pdn-consent"));
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-x-0 z-[55] px-3 bottom-[calc(4.75rem+var(--safe-bottom))] md:bottom-[calc(1rem+var(--safe-bottom))]"
      role="dialog"
      aria-label="Уведомление о персональных данных и cookies"
    >
      <div className="mx-auto max-w-3xl border border-[var(--border-subtle)] bg-elevated/95 backdrop-blur-md shadow-[0_12px_40px_rgba(0,0,0,0.45)] px-4 py-3.5 sm:px-5 sm:py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
          <p className="text-[12px] sm:text-[13px] text-mute leading-relaxed flex-1">
            Мы используем cookies и обрабатываем персональные данные для работы сайта, бронирования
            и связи с вами. Продолжая пользоваться сайтом, вы соглашаетесь с{" "}
            <Link
              href={SITE.legal.privacyPath}
              className="text-accent hover:underline underline-offset-2"
            >
              Политикой обработки персональных данных
            </Link>
            .
          </p>
          <button
            type="button"
            className="btn btn-primary shrink-0 w-full sm:w-auto text-sm px-5"
            onClick={accept}
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
}
