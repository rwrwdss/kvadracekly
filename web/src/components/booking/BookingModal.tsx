"use client";

import { FormEvent, useCallback, useEffect, useId, useMemo, useState } from "react";
import { ROUTES, SITE } from "@/data/site";
import { LEAD_SOURCES, type LeadSourceValue } from "@/data/leadSources";
import { useBooking } from "@/components/booking/BookingContext";
import { useCustomerAuth } from "@/components/auth/CustomerAuthContext";
import { BookingCalendar } from "@/components/booking/BookingCalendar";
import {
  NIGHT_QUEST_TITLE,
  buildProgress,
  isRouteBookable,
  type ProgressInfo,
} from "@/lib/booking/progress";
import { resolveDurationMinutes } from "@/lib/booking/slots";
import { acquireLenisLock, releaseLenisLock } from "@/lib/lenisControl";

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

function isNightMode(prefill: { source?: string; route?: string; bookingKind?: string }) {
  if (prefill.bookingKind === "night") return true;
  const source = String(prefill.source || "").toLowerCase();
  if (source === "night_quest" || source.includes("night")) return true;
  const route = String(prefill.route || "").trim();
  return route === NIGHT_QUEST_TITLE || route.toLowerCase().includes("ночн");
}

export function BookingModal() {
  const { open, prefill, closeBooking } = useBooking();
  const { user } = useCustomerAuth();
  const titleId = useId();
  const night = isNightMode(prefill);

  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [route, setRoute] = useState("");
  const [dateValue, setDateValue] = useState("");
  const [errorText, setErrorText] = useState("");
  const [progress, setProgress] = useState<ProgressInfo>(() => buildProgress(0));
  const [guests, setGuests] = useState(1);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [contactPrefer, setContactPrefer] = useState("WhatsApp");
  const [riderExperience, setRiderExperience] = useState<"novice" | "experienced" | "regular">(
    "novice",
  );
  const [heardFrom, setHeardFrom] = useState<LeadSourceValue | "">("");

  const applyRouteForProgress = useCallback(
    (pref: string, completedThrough: number) => {
      if (pref && pref !== NIGHT_QUEST_TITLE && !isRouteBookable(pref, completedThrough)) {
        const fallback =
          ROUTES.find((r) => r.progressOrder === completedThrough + 1)?.title || ROUTES[0].title;
        setRoute(fallback);
        setErrorText(
          `«${pref}» пока закрыт. По вашему прогрессу открыт «${fallback}». Следующие маршруты — после прохождения предыдущих.`,
        );
        return;
      }
      setRoute(pref);
    },
    [],
  );

  useEffect(() => {
    if (!open) return;
    setStatus("idle");
    setErrorText("");
    setDateValue("");
    setGuests(1);
    setContactPrefer("WhatsApp");
    setHeardFrom("");
    setRiderExperience(
      user?.progress?.completedThrough && user.progress.completedThrough > 0
        ? "regular"
        : "novice",
    );

    if (night) {
      setRoute(prefill.route || NIGHT_QUEST_TITLE);
      setGuestName(user?.name || "");
      setGuestPhone(user?.phone || "");
      return;
    }

    if (!user) return;
    setProgress(user.progress || buildProgress(0));
    applyRouteForProgress(prefill.route ?? "", user.progress?.completedThrough ?? 0);
  }, [open, prefill, user, night, applyRouteForProgress]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeBooking();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    document.documentElement.classList.add("lenis-stopped");
    acquireLenisLock();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      document.documentElement.classList.remove("lenis-stopped");
      releaseLenisLock();
    };
  }, [open, closeBooking]);

  const unlockedRoutes = useMemo(
    () => ROUTES.filter((r) => r.progressOrder <= progress.unlockedOrder),
    [progress.unlockedOrder],
  );

  const durationMinutes = useMemo(
    () => resolveDurationMinutes(route || prefill.route),
    [route, prefill.route],
  );

  if (!open) return null;
  if (!night && !user) return null;

  async function onSubmitDay(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    if (!dateValue) {
      setStatus("error");
      setErrorText("Выберите дату и время в календаре");
      return;
    }
    setStatus("loading");
    setErrorText("");
    const form = new FormData(e.currentTarget);
    const heard = String(form.get("heardFrom") || heardFrom || "").trim();
    const payload = {
      name: user.name,
      phone: user.phone,
      date: dateValue,
      route: String(form.get("route") || route),
      guests: Number(form.get("guests") || guests) || 1,
      message: String(form.get("message") || ""),
      riderExperience: String(form.get("riderExperience") || riderExperience),
      source: heard || prefill.source || "booking_modal",
      tariff: prefill.tariff || "",
      productId: prefill.productId,
      bookingKind: "day" as const,
      durationMinutes,
      pageUrl: typeof window !== "undefined" ? window.location.href : "",
      utm: readUtmFromUrl(),
    };

    try {
      const res = await fetch("/api/booking", {
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

  async function onSubmitNight(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorText("");
    const form = new FormData(e.currentTarget);
    const heard = String(form.get("heardFrom") || heardFrom || "").trim();
    const payload = {
      name: String(form.get("name") || guestName).trim(),
      phone: String(form.get("phone") || guestPhone).trim(),
      route: NIGHT_QUEST_TITLE,
      guests: Number(form.get("guests") || guests) || 1,
      message: String(form.get("message") || ""),
      riderExperience: String(form.get("riderExperience") || riderExperience),
      source: heard || prefill.source || "night_quest",
      tariff: prefill.tariff || NIGHT_QUEST_TITLE,
      productId: prefill.productId,
      bookingKind: "night" as const,
      contactPrefer: String(form.get("contactPrefer") || contactPrefer),
      pageUrl: typeof window !== "undefined" ? window.location.href : "",
      utm: readUtmFromUrl(),
    };

    try {
      const res = await fetch("/api/booking", {
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

      <div
        className="booking-sheet relative w-full sm:max-w-xl bg-elevated border border-[var(--border-subtle)] border-b-0 sm:border-b shadow-[0_-12px_40px_rgba(0,0,0,0.45)] sm:shadow-[0_20px_60px_rgba(0,0,0,0.55)] max-h-[min(92dvh,920px)] overflow-y-auto overscroll-contain"
        data-lenis-prevent
      >
        <div className="sticky top-0 z-10 flex justify-center pt-3 pb-1 sm:hidden bg-elevated">
          <span className="h-1 w-10 rounded-full bg-white/20" aria-hidden />
        </div>

        <div className="px-5 pb-[calc(1.25rem+var(--safe-bottom))] pt-2 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-5 sm:mb-6">
            <div className="min-w-0">
              <p className="section-label">{night ? "Ночной квест" : "Бронирование"}</p>
              <h2
                id={titleId}
                className="font-display text-[1.35rem] sm:text-2xl tracking-wide uppercase mt-1 leading-tight"
              >
                {night ? "Оставить заявку" : "Оставить заявку"}
              </h2>
              <p className="text-sm text-mute mt-2 leading-relaxed">
                {night
                  ? "Дата и время согласуем в WhatsApp или Telegram после заявки."
                  : `${user?.name} · ${user?.phone}. Открыт уровень до «${
                      unlockedRoutes[unlockedRoutes.length - 1]?.title || ROUTES[0].title
                    }».`}
              </p>
            </div>
            <button
              type="button"
              onClick={closeBooking}
              className="shrink-0 flex h-10 w-10 items-center justify-center border border-[var(--border-subtle)] text-mute hover:text-ink hover:border-accent transition-colors"
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

          {status === "ok" ? (
            <div className="py-8 sm:py-10 text-center">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center border border-[var(--accent-border)] text-accent text-2xl">
                ✓
              </div>
              <p className="text-accent section-label">Готово</p>
              <p className="mt-3 text-lg sm:text-xl font-display tracking-wide uppercase">
                {night ? "Заявка принята" : "Вы в очереди"}
              </p>
              {!night && dateValue && <p className="mt-2 text-sm text-accent">{dateValue}</p>}
              {route && <p className="mt-1 text-sm text-mute">{route}</p>}
              <p className="mt-1 text-sm text-mute">Гостей: {guests}</p>
              <p className="mt-2 text-sm text-mute">
                {night
                  ? "Напишем в выбранный мессенджер и согласуем дату выезда."
                  : "Скоро свяжемся по указанному телефону."}
              </p>
              <button type="button" className="btn btn-primary mt-8 w-full sm:w-auto" onClick={closeBooking}>
                Закрыть
              </button>
            </div>
          ) : night ? (
            <form onSubmit={onSubmitNight} className="grid gap-3.5 sm:gap-4">
              <p className="text-sm text-mute leading-relaxed border border-[var(--border-subtle)] p-3 bg-card/50">
                Календарный слот не нужен: менеджер свяжется и подберёт ночное окно под группу.
              </p>

              <label className="grid gap-1.5 text-sm">
                <span className="text-mute">Имя</span>
                <input
                  name="name"
                  className="input"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  required
                  minLength={2}
                  autoComplete="name"
                />
              </label>

              <label className="grid gap-1.5 text-sm">
                <span className="text-mute">Телефон</span>
                <input
                  name="phone"
                  className="input"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  required
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+7…"
                />
              </label>

              <label className="grid gap-1.5 text-sm">
                <span className="text-mute">Как связаться</span>
                <select
                  name="contactPrefer"
                  className="input"
                  value={contactPrefer}
                  onChange={(e) => setContactPrefer(e.target.value)}
                >
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Telegram">Telegram</option>
                  <option value="Звонок">Звонок</option>
                </select>
              </label>

              <label className="grid gap-1.5 text-sm">
                <span className="text-mute">Откуда о нас узнали</span>
                <select
                  name="heardFrom"
                  className="input"
                  value={heardFrom}
                  onChange={(e) => setHeardFrom(e.target.value as LeadSourceValue | "")}
                  required
                >
                  <option value="" disabled>
                    Выберите вариант
                  </option>
                  {LEAD_SOURCES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1.5 text-sm">
                <span className="text-mute">Опыт за рулём</span>
                <select
                  name="riderExperience"
                  className="input"
                  value={riderExperience}
                  onChange={(e) =>
                    setRiderExperience(e.target.value as "novice" | "experienced" | "regular")
                  }
                  required
                >
                  <option value="novice">Новичок — старт с «Зелёного озера»</option>
                  <option value="experienced">Уже катался — подберите уровень</option>
                  <option value="regular">Постоянный гость Вольницы</option>
                </select>
                <span className="text-[11px] text-faint leading-relaxed">
                  Нужно, чтобы опытный гость не начинал с маршрута для новичков.
                </span>
              </label>

              <label className="grid gap-1.5 text-sm">
                <span className="text-mute">Количество человек</span>
                <select
                  name="guests"
                  className="input"
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value) || 1)}
                  required
                >
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1.5 text-sm">
                <span className="text-mute">Комментарий</span>
                <textarea
                  name="message"
                  rows={3}
                  className="input resize-none min-h-[5.5rem]"
                  placeholder="Пожелания к ночному выезду, удобные дни…"
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
                Или позвоните{" "}
                <a href={`tel:${SITE.phone.replace(/[^\d+]/g, "")}`} className="text-accent">
                  {SITE.phone}
                </a>
              </p>
            </form>
          ) : (
            <form onSubmit={onSubmitDay} className="grid gap-3.5 sm:gap-4">
              <label className="grid gap-1.5 text-sm">
                <span className="text-mute">Маршрут (по прогрессу)</span>
                <select
                  name="route"
                  className="input"
                  value={route}
                  onChange={(e) => {
                    setRoute(e.target.value);
                    setDateValue("");
                  }}
                >
                  <option value="">Подберём вместе</option>
                  {unlockedRoutes.map((r) => (
                    <option key={r.id} value={r.title}>
                      {r.title} — {r.price.toLocaleString("ru-RU")} ₽ · ~
                      {resolveDurationMinutes(r.title)} мин
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-faint leading-relaxed">
                  Длительность ~{durationMinutes} мин влияет на свободные старты (режим до 22:00).
                </span>
              </label>

              <BookingCalendar
                value={dateValue}
                onChange={setDateValue}
                durationMinutes={durationMinutes}
                required
              />

              <label className="grid gap-1.5 text-sm">
                <span className="text-mute">Откуда о нас узнали</span>
                <select
                  name="heardFrom"
                  className="input"
                  value={heardFrom}
                  onChange={(e) => setHeardFrom(e.target.value as LeadSourceValue | "")}
                  required
                >
                  <option value="" disabled>
                    Выберите вариант
                  </option>
                  {LEAD_SOURCES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1.5 text-sm">
                <span className="text-mute">Опыт за рулём</span>
                <select
                  name="riderExperience"
                  className="input"
                  value={riderExperience}
                  onChange={(e) =>
                    setRiderExperience(e.target.value as "novice" | "experienced" | "regular")
                  }
                  required
                >
                  <option value="novice">Новичок — старт с «Зелёного озера»</option>
                  <option value="experienced">Уже катался — подберите уровень</option>
                  <option value="regular">Постоянный гость Вольницы</option>
                </select>
                <span className="text-[11px] text-faint leading-relaxed">
                  Нужно, чтобы опытный гость не начинал с маршрута для новичков.
                </span>
              </label>

              <label className="grid gap-1.5 text-sm">
                <span className="text-mute">Количество человек</span>
                <select
                  name="guests"
                  className="input"
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value) || 1)}
                  required
                >
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1.5 text-sm">
                <span className="text-mute">Комментарий</span>
                <textarea
                  name="message"
                  rows={3}
                  className="input resize-none min-h-[5.5rem]"
                  placeholder="Пожелания к выезду…"
                />
              </label>

              {status === "error" && (
                <p className="text-sm text-[var(--diff-hard)] leading-relaxed" role="alert">
                  {errorText || "Не удалось отправить. Попробуйте ещё раз или позвоните нам."}
                </p>
              )}
              {status !== "error" && errorText && (
                <p className="text-sm text-accent leading-relaxed">{errorText}</p>
              )}

              <button
                type="submit"
                className="btn btn-primary mt-1 w-full"
                disabled={status === "loading"}
              >
                {status === "loading" ? "Отправка…" : "Встать в очередь"}
              </button>
              <p className="text-[11px] text-faint text-center leading-relaxed">
                Или позвоните{" "}
                <a href={`tel:${SITE.phone.replace(/[^\d+]/g, "")}`} className="text-accent">
                  {SITE.phone}
                </a>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
