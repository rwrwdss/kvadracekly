"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { NAV, SITE } from "@/data/site";
import { useBooking } from "@/components/booking/BookingContext";

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group min-w-0">
      <figure className="m-0 shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={SITE.logo}
          alt={SITE.logoAlt}
          width={40}
          height={40}
          className="h-9 w-9 sm:h-10 sm:w-10 object-contain"
        />
      </figure>
      <span className={compact ? "hidden sm:block min-w-0" : "block min-w-0"}>
        <span className="font-display block text-xs sm:text-sm tracking-[0.14em] sm:tracking-[0.18em] uppercase text-ink group-hover:text-accent transition-colors truncate">
          {SITE.name}
        </span>
        <span className="block text-[9px] sm:text-[10px] tracking-[0.12em] sm:tracking-[0.16em] uppercase text-mute truncate">
          {SITE.tagline}
        </span>
      </span>
    </Link>
  );
}

export function Header() {
  const { openBooking } = useBooking();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || menuOpen
          ? "bg-[rgba(10,15,12,0.92)] backdrop-blur-md border-b border-[var(--border-subtle)]"
          : "bg-transparent"
      }`}
    >
      <div className="container-wide flex h-[64px] sm:h-[72px] items-center justify-between gap-3 sm:gap-4 pt-[env(safe-area-inset-top,0px)]">
        <Logo compact />

        <nav className="hidden lg:flex items-center gap-5 xl:gap-6">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[11px] xl:text-xs tracking-[0.12em] uppercase text-mute hover:text-accent transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            className="btn btn-ghost hidden sm:inline-flex !py-2.5 !px-3.5"
            onClick={() => openBooking({ source: "header" })}
          >
            <CalendarIcon />
            Забронировать
          </button>

          <button
            type="button"
            className="lg:hidden grid h-11 w-11 place-items-center border border-[var(--border-subtle)] text-ink"
            aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden border-t border-[var(--border-subtle)] bg-[rgba(10,15,12,0.98)] max-h-[calc(100dvh-64px)] overflow-y-auto">
          <nav className="container-site flex flex-col py-3 pb-[calc(1rem+var(--safe-bottom))]">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="py-3.5 text-sm tracking-[0.12em] uppercase text-ink border-b border-[var(--border-subtle)]"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/lk"
              className="py-3.5 text-sm tracking-[0.12em] uppercase text-mute"
              onClick={() => setMenuOpen(false)}
            >
              Личный кабинет
            </Link>
            <button
              type="button"
              className="btn btn-primary mt-4 w-full"
              onClick={() => {
                setMenuOpen(false);
                openBooking({ source: "mobile_menu" });
              }}
            >
              Забронировать
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
