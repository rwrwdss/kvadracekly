"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { NAV, SITE } from "@/data/site";
import { useBooking } from "@/components/booking/BookingContext";
import { useCustomerAuth } from "@/components/auth/CustomerAuthContext";

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center group min-w-0" aria-label={SITE.name}>
      <figure className="m-0 shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={SITE.logo}
          alt={SITE.logoAlt}
          width={160}
          height={136}
          className={
            compact
              ? "h-11 w-auto sm:h-12 max-w-[9.5rem] sm:max-w-[11rem] object-contain object-left"
              : "h-14 w-auto max-w-[12rem] object-contain object-left"
          }
        />
      </figure>
    </Link>
  );
}

export function Header() {
  const { openBooking } = useBooking();
  const { user, openAuth, logout, loading } = useCustomerAuth();
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
          {!loading && user ? (
            <Link
              href="/lk"
              className="hidden sm:inline-flex text-[11px] tracking-[0.1em] uppercase text-mute hover:text-accent max-w-[9rem] truncate"
              title={user.phone}
            >
              {user.name}
            </Link>
          ) : !loading ? (
            <button
              type="button"
              className="hidden sm:inline-flex text-[11px] tracking-[0.1em] uppercase text-mute hover:text-accent"
              onClick={() => openAuth({ intent: "header" })}
            >
              Вход
            </button>
          ) : null}

          <button
            type="button"
            className="btn btn-ghost hidden sm:inline-flex !py-2.5 !px-3.5"
            onClick={() => openBooking({ source: "header" })}
          >
            <CalendarIcon />
            Запись
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
            {user ? (
              <button
                type="button"
                className="py-3.5 text-left text-sm tracking-[0.12em] uppercase text-faint"
                onClick={() => {
                  setMenuOpen(false);
                  void logout();
                }}
              >
                Выйти ({user.name})
              </button>
            ) : (
              <button
                type="button"
                className="py-3.5 text-left text-sm tracking-[0.12em] uppercase text-mute"
                onClick={() => {
                  setMenuOpen(false);
                  openAuth({ intent: "mobile_menu" });
                }}
              >
                Вход / регистрация
              </button>
            )}
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
