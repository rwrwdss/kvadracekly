"use client";

import { FormEvent, useEffect, useState } from "react";
import { ROUTES } from "@/data/site";
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
    return () => window.removeEventListener("keydown", onKey);
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
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/70"
        aria-label="Закрыть"
        onClick={closeBooking}
      />
      <div className="relative w-full sm:max-w-lg bg-elevated border border-[var(--border-subtle)] p-6 sm:p-8 max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="section-label">Бронирование</p>
            <h2 className="font-display text-2xl tracking-wide uppercase mt-1">
              Оставить заявку
            </h2>
            <p className="text-sm text-mute mt-2">
              Заявка сохранится в CRM (Payload). Мы свяжемся и подтвердим слот.
            </p>
          </div>
          <button
            type="button"
            onClick={closeBooking}
            className="text-mute hover:text-ink text-xl leading-none"
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>

        {status === "ok" ? (
          <div className="py-8 text-center">
            <p className="text-accent section-label">Готово</p>
            <p className="mt-3 text-lg">Заявка принята. Скоро свяжемся.</p>
            <button type="button" className="btn btn-primary mt-8" onClick={closeBooking}>
              Закрыть
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="grid gap-4">
            <label className="grid gap-1.5 text-sm">
              <span className="text-mute">Имя</span>
              <input name="name" required className="input" placeholder="Как к вам обращаться" />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="text-mute">Телефон</span>
              <input name="phone" required className="input" placeholder="+7" inputMode="tel" />
            </label>
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
            <label className="grid gap-1.5 text-sm">
              <span className="text-mute">Комментарий</span>
              <textarea
                name="message"
                rows={3}
                className="input resize-none"
                placeholder="Количество человек, пожелания…"
              />
            </label>

            {status === "error" && (
              <p className="text-sm text-[var(--diff-hard)]">
                {errorText || "Не удалось отправить. Попробуйте ещё раз или позвоните нам."}
              </p>
            )}

            <button type="submit" className="btn btn-primary mt-2" disabled={status === "loading"}>
              {status === "loading" ? "Отправка…" : "Отправить заявку"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
