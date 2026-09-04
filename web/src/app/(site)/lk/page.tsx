"use client";

import { useMemo, useState } from "react";
import { ROUTES, formatPrice } from "@/data/site";
import { Breadcrumbs, difficultyClass } from "@/components/ui/PageHero";
import { BookButton } from "@/components/ui/BookButton";

/** Демо-ЛК: прогресс хранится локально до Payload auth. */
export default function LkPage() {
  const [completedThrough, setCompletedThrough] = useState(0);
  const [authed, setAuthed] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");

  const rows = useMemo(
    () =>
      ROUTES.map((route) => {
        const unlocked = route.progressOrder <= completedThrough + 1;
        const done = route.progressOrder <= completedThrough;
        return { route, unlocked, done };
      }),
    [completedThrough],
  );

  if (!authed) {
    return (
      <section className="pt-28 pb-20 md:pt-32">
        <div className="container-site max-w-md">
          <Breadcrumbs
            items={[
              { label: "Главная", href: "/" },
              { label: "Личный кабинет" },
            ]}
          />
          <h1 className="section-title text-[clamp(1.8rem,4vw,2.4rem)]">
            {mode === "login" ? "Вход" : "Регистрация"}
          </h1>
          <p className="mt-3 text-sm text-mute">
            В ЛК открывается прогресс трасс: сначала только «Зелёное озеро», затем следующие по
            порядку после отметки администратора.
          </p>

          <form
            className="mt-8 grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              setAuthed(true);
            }}
          >
            {mode === "register" && (
              <label className="grid gap-1.5 text-sm">
                <span className="text-mute">Имя</span>
                <input className="input" name="name" required placeholder="Имя" />
              </label>
            )}
            <label className="grid gap-1.5 text-sm">
              <span className="text-mute">Email</span>
              <input className="input" type="email" name="email" required placeholder="you@mail.ru" />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="text-mute">Пароль</span>
              <input className="input" type="password" name="password" required placeholder="••••••••" />
            </label>
            <button type="submit" className="btn btn-primary mt-2">
              {mode === "login" ? "Войти" : "Создать аккаунт"}
            </button>
          </form>

          <button
            type="button"
            className="mt-6 text-sm text-mute hover:text-accent"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Нет аккаунта? Регистрация" : "Уже есть аккаунт? Войти"}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-28 pb-20 md:pt-32">
      <div className="container-site">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Breadcrumbs
              items={[
                { label: "Главная", href: "/" },
                { label: "Личный кабинет" },
              ]}
            />
            <h1 className="section-title text-[clamp(1.8rem,4vw,2.4rem)]">Мои маршруты</h1>
            <p className="mt-3 text-sm text-mute max-w-xl">
              Открыт следующий доступный уровень. После заезда менеджер в CRM отметит прохождение —
              откроется следующая трасса.
            </p>
          </div>
          <button type="button" className="btn btn-ghost" onClick={() => setAuthed(false)}>
            Выйти
          </button>
        </div>

        <div className="mt-10 grid gap-4">
          {rows.map(({ route, unlocked, done }) => (
            <article
              key={route.id}
              className={`card-dark p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4 ${
                unlocked ? "" : "opacity-60"
              }`}
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`badge ${difficultyClass(route.difficulty)}`}>
                    {route.difficultyLabel}
                  </span>
                  {done && <span className="badge badge-easy">Пройден</span>}
                  {!unlocked && <span className="badge badge-hard">Закрыт</span>}
                  {unlocked && !done && <span className="badge badge-medium">Доступен</span>}
                </div>
                <h2 className="font-display text-xl uppercase tracking-wide mt-3">{route.title}</h2>
                <p className="mt-2 text-sm text-mute">
                  {route.duration} · {route.distance} · {formatPrice(route.price)}
                </p>
                {!unlocked && (
                  <p className="mt-2 text-xs text-faint">
                    Откроется после прохождения:{" "}
                    {ROUTES.find((r) => r.progressOrder === route.progressOrder - 1)?.title}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {unlocked ? (
                  <BookButton prefill={{ route: route.title, source: "lk_booking" }}>
                    Забронировать
                  </BookButton>
                ) : (
                  <button type="button" className="btn btn-ghost opacity-50 cursor-not-allowed" disabled>
                    🔒 Закрыто
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 card-dark p-6">
          <p className="section-label">Демо для приёмки UI</p>
          <p className="mt-2 text-sm text-mute">
            Пока нет Payload: имитация отметки админа «маршрут пройден».
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setCompletedThrough((v) => Math.min(4, v + 1))}
            >
              Отметить следующий как пройденный
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setCompletedThrough(0)}>
              Сбросить прогресс
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
