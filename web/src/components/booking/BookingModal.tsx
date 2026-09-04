"use client";

import { FormEvent, useEffect, useId, useState } from "react";
import { ROUTES, SITE } from "@/data/site";
import { useBooking } from "@/components/booking/BookingContext";

function readUtmFromUrl() {
  if (typeof window === "undefined") return {};
  const p = new URLSearchParams(window.location.search);
  return {
    source: p.get("utm_source") || undefined,
    medium: p.get("utm_medium") || undefined,
    campaign: p.get("utm_campaign") || undefined,
    content: p.get("utm_content") || undefined,
    term: p.get("utm_term") || undefined,
  };
}

export function BookingModal() {
  const { open, prefill, closeBooking } = useBooking();
  const titleId = useId();
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [route, setRoute] = useState("");
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    if (open) {
      setStatus("idle");
      setErrorText("");
      setRoute(prefill.route ?? "");
    }
  }, [open, prefill]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeBooking();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, closeBooking]);

  if (!open) return null;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorText("");
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") || ""),
      phone: String(form.get("phone") || ""),
      date: String(form.get("date") || ""),
      route: String(form.get("route") || ""),
      message: String(form.get("message") || ""),
      source: prefill.source || "booking_modal",
      tariff: prefill.tariff || "",
      productId: prefill.productId,
      pageUrl: typeof window !== "undefined" ? window.location.href : "",
      utm: readUtmFromUrl(),
    };

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "fail");
      setStatus("ok");
    } catch (err) {
      setStatus("error");
      setErrorText(err instanceof Error ? err.message : "Ошибка отправки");
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-[2px]"
        aria-label="Закрыть"
        onClick={closeBooking}
      />

      <div className="booking-sheet relative w-full sm:max-w-lg bg-elevated border border-[var(--border-subtle)] border-b-0 sm:border-b shadow-[0_-12px_40px_rgba(0,0,0,0.45)] sm:shadow-[0_20px_60px_rgba(0,0,0,0.55)] max-h-[min(92dvh,920px)] overflow-y-auto overscroll-contain">
        <div className="sticky top-0 z-10 flex justify-center pt-3 pb-1 sm:hidden bg-elevated">
          <span className="h-1 w-10 rounded-full bg-white/20" aria-hidden />
        </div>

        <div className="px-5 pb-[calc(1.25rem+var(--safe-bottom))] pt-2 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-5 sm:mb-6">
            <div className="min-w-0">
              <p className="section-label">Бронирование</p>
              <h2
                id={titleId}
                className="font-display text-[1.35rem] sm:text-2xl tracking-wide uppercase mt-1 leading-tight"
              >
                Оставить заявку
              </h2>
              <p className="text-sm text-mute mt-2 leading-relaxed">
                Сохраним в CRM и свяжемся для подтверждения. Или позвоните{" "}
                <a
                  href={`tel:${SITE.phone.replace(/[^\d+]/g, "")}`}
                  className="text-accent hover:underline"
                >
                  {SITE.phone}
                </a>
              </p>
            </div>
            <button
              type="button"
              onClick={closeBooking}
              className="shrink-0 grid h-10 w-10 place-items-center border border-[var(--border-subtle)] text-mute hover:text-ink hover:border-accent transition-colors"
              aria-label="Закрыть"
            >
              ×
            </button>
          </div>

          {status === "ok" ? (
            <div className="py-8 sm:py-10 text-center">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center border border-[var(--accent-border)] text-accent text-2xl">
                ✓
              </div>
              <p className="text-accent section-label">Готово</p>
              <p className="mt-3 text-lg sm:text-xl font-display tracking-wide uppercase">
                Заявка принята
              </p>
              <p className="mt-2 text-sm text-mute">Скоро свяжемся по указанному телефону.</p>
              <button type="button" className="btn btn-primary mt-8 w-full sm:w-auto" onClick={closeBooking}>
                Закрыть
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="grid gap-3.5 sm:gap-4">
              <label className="grid gap-1.5 text-sm">
                <span className="text-mute">Имя</span>
                <input
                  name="name"
                  required
                  autoComplete="name"
                  className="input"
                  placeholder="Как к вам обращаться"
                />
              </label>
              <label className="grid gap-1.5 text-sm">
                <span className="text-mute">Телефон</span>
                <input
                  name="phone"
                  required
                  autoComplete="tel"
                  className="input"
                  placeholder="+7 (___) ___-__-__"
                  inputMode="tel"
                />
              </label>
              <div className="grid gap-3.5 sm:grid-cols-2 sm:gap-4">
                <label className="grid gap-1.5 text-sm">
                  <span className="text-mute">Желаемая дата</span>
                  <input name="date" type="date" className="input" />
                </label>
                <label className="grid gap-1.5 text-sm">
                  <span className="text-mute">Маршрут</span>
                  <select
                    name="route"
                    className="input"
                    value={route}
                    onChange={(e) => setRoute(e.target.value)}
                  >
                    <option value="">Подберём вместе</option>
                    {ROUTES.map((r) => (
                      <option key={r.id} value={r.title}>
                        {r.title} — {r.price.toLocaleString("ru-RU")} ₽
                      </option>
                    ))}
                    <option value="Ночной квест">Ночной квест</option>
                  </select>
                </label>
              </div>
              <label className="grid gap-1.5 text-sm">
                <span className="text-mute">Комментарий</span>
                <textarea
                  name="message"
                  rows={3}
                  className="input resize-none min-h-[5.5rem]"
                  placeholder="Количество человек, пожелания…"
                />
              </label>

              {status === "error" && (
                <p className="text-sm text-[var(--diff-hard)] leading-relaxed" role="alert">
                  {errorText || "Не удалось отправить. Попробуйте ещё раз или позвоните нам."}
                </p>
              )}

              <button
                type="submit"
                className="btn btn-primary mt-1 w-full"
                disabled={status === "loading"}
              >
                {status === "loading" ? "Отправка…" : "Отправить заявку"}
              </button>
              <p className="text-[11px] text-faint text-center leading-relaxed">
                Нажимая кнопку, вы соглашаетесь на обработку заявки менеджером Вольницы.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
