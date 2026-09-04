"use client";

import { FormEvent, useEffect, useId, useState } from "react";
import { useCustomerAuth } from "@/components/auth/CustomerAuthContext";

export function AuthModal() {
  const { authOpen, closeAuth, login, consumePendingAction } = useCustomerAuth();
  const titleId = useId();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authOpen) return;
    setError("");
    setLoading(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAuth();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [authOpen, closeAuth]);

  if (!authOpen) return null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await login({ name, phone });
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    // После setUser — открыть отложенную запись на следующем тике
    window.setTimeout(() => consumePendingAction(), 0);
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-[2px]"
        aria-label="Закрыть"
        onClick={closeAuth}
      />

      <div className="relative w-full sm:max-w-md bg-elevated border border-[var(--border-subtle)] border-b-0 sm:border-b shadow-[0_-12px_40px_rgba(0,0,0,0.45)] sm:shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <div className="px-5 pb-[calc(1.25rem+var(--safe-bottom))] pt-5 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <p className="section-label">Вход</p>
              <h2
                id={titleId}
                className="font-display text-[1.35rem] sm:text-2xl tracking-wide uppercase mt-1"
              >
                Войти или зарегистрироваться
              </h2>
              <p className="text-sm text-mute mt-2 leading-relaxed">
                Нужен телефон с заявок — так видно, какие маршруты уже открыты по прогрессу.
              </p>
            </div>
            <button
              type="button"
              onClick={closeAuth}
              className="shrink-0 flex h-10 w-10 items-center justify-center border border-[var(--border-subtle)] text-mute hover:text-ink"
              aria-label="Закрыть"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path
                  d="M1 1l12 12M13 1L1 13"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="square"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={onSubmit} className="grid gap-3.5">
            <label className="grid gap-1.5 text-sm">
              <span className="text-mute">Имя</span>
              <input
                className="input"
                required
                autoComplete="name"
                placeholder="Как к вам обращаться"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="text-mute">Телефон</span>
              <input
                className="input"
                required
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+7 (___) ___-__-__"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>

            {error ? (
              <p className="text-sm text-[var(--diff-hard)]" role="alert">
                {error}
              </p>
            ) : null}

            <button type="submit" className="btn btn-primary w-full mt-1" disabled={loading}>
              {loading ? "Входим…" : "Продолжить"}
            </button>
            <p className="text-[11px] text-faint text-center leading-relaxed">
              Новый гость получит доступ к «Зелёному озеру». Следующие маршруты откроются после
              заездов.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
