"use client";

import Link from "next/link";
import { SITE } from "@/data/site";
import { useBooking } from "@/components/booking/BookingContext";

export function Footer() {
  const { openBooking } = useBooking();

  return (
    <footer className="border-t border-[var(--border-subtle)] bg-void">
      <div className="container-site py-12 md:py-16 grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <p className="font-display text-xl tracking-[0.14em] uppercase text-accent">
            {SITE.name}
          </p>
          <p className="mt-2 text-sm text-mute max-w-sm">
            Премиальный прокат квадроциклов при усадьбе «Берегиня». Авторские
            маршруты, техника и сервис — около 25 минут от Казани.
          </p>
        </div>

        <div>
          <p className="section-label mb-3">Контакты</p>
          <a href={`tel:${SITE.phone.replace(/[^\d+]/g, "")}`} className="block text-ink hover:text-accent">
            {SITE.phone}
          </a>
          <a href={`mailto:${SITE.email}`} className="block mt-2 text-mute hover:text-accent">
            {SITE.email}
          </a>
          <p className="mt-3 text-sm text-mute">{SITE.hours}</p>
          <p className="mt-1 text-sm text-mute">{SITE.location}</p>
        </div>

        <div>
          <p className="section-label mb-3">Навигация</p>
          <div className="flex flex-col gap-2 text-sm text-mute">
            <Link href="/marshruty" className="hover:text-accent">Маршруты</Link>
            <Link href="/tarify" className="hover:text-accent">Тарифы</Link>
            <Link href="/lk" className="hover:text-accent">Личный кабинет</Link>
            <Link href="/faq" className="hover:text-accent">FAQ</Link>
          </div>
          <button
            type="button"
            className="btn btn-primary mt-6"
            onClick={() => openBooking({ source: "footer" })}
          >
            Забронировать сейчас
          </button>
        </div>
      </div>
      <div className="border-t border-[var(--border-subtle)] py-4 text-center text-xs text-faint">
        © {new Date().getFullYear()} {SITE.name}. Территория свободы.
      </div>
    </footer>
  );
}

export function StickyBookBar() {
  const { openBooking } = useBooking();

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 sticky-book px-3 md:hidden bg-gradient-to-t from-void via-void/95 to-transparent pt-4">
      <button
        type="button"
        className="btn btn-primary btn-block shadow-[0_-8px_30px_rgba(0,0,0,0.45)]"
        onClick={() => openBooking({ source: "sticky_mobile" })}
      >
        <span className="flex flex-col items-center leading-tight">
          <span>Забронировать сейчас</span>
          <span className="normal-case tracking-normal font-medium opacity-85 text-[11px]">
            Быстрое бронирование в 1 клик
          </span>
        </span>
      </button>
    </div>
  );
}
