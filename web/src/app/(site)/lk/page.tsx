"use client";

import { useEffect, useMemo } from "react";
import { ROUTES, SITE, formatPrice } from "@/data/site";
import { Breadcrumbs, difficultyClass } from "@/components/ui/PageHero";
import { BookButton } from "@/components/ui/BookButton";
import { useCustomerAuth } from "@/components/auth/CustomerAuthContext";

export default function LkPage() {
  const { user, loading, openAuth, logout, refresh } = useCustomerAuth();

  useEffect(() => {
    if (!loading && user) void refresh();
  }, [loading, user, refresh]);

  const progress = user?.progress;
  const rows = useMemo(() => {
    const completedThrough = progress?.completedThrough ?? 0;
    const unlockedOrder = progress?.unlockedOrder ?? 1;
    return ROUTES.map((route) => {
      const unlocked = route.progressOrder <= unlockedOrder;
      const done = route.progressOrder <= completedThrough;
      return { route, unlocked, done };
    });
  }, [progress]);

  if (loading) {
    return (
      <section className="pt-28 pb-20 md:pt-32">
        <div className="container-site">
          <p className="text-mute text-sm">Загрузка…</p>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="pt-28 pb-20 md:pt-32">
        <div className="container-site max-w-xl">
          <Breadcrumbs
            items={[
              { label: "Главная", href: "/" },
              { label: "Личный кабинет" },
            ]}
          />
          <h1 className="section-title text-[clamp(1.8rem,4vw,2.4rem)]">Личный кабинет</h1>
          <p className="mt-3 text-sm text-mute leading-relaxed">
            Войдите по имени и телефону — покажем открытые маршруты и дадим записаться только на
            доступный уровень.
          </p>
          <button
            type="button"
            className="btn btn-primary mt-6 w-full sm:w-auto"
            onClick={() => openAuth({ intent: "lk" })}
          >
            Войти / зарегистрироваться
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-28 pb-20 md:pt-32">
      <div className="container-site">
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "Личный кабинет" },
          ]}
        />
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="section-title text-[clamp(1.8rem,4vw,2.4rem)]">Мои маршруты</h1>
            <p className="mt-3 text-sm text-mute max-w-2xl leading-relaxed">
              {user.name} · {user.phone}. Пройдено уровней {progress?.completedThrough ?? 0} из{" "}
              {ROUTES.length}.
              Запись только на открытый маршрут.
            </p>
          </div>
          <button type="button" className="btn btn-ghost w-full sm:w-auto" onClick={() => void logout()}>
            Выйти
          </button>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row flex-wrap gap-3">
          <BookButton
            prefill={{
              source: "lk_queue",
              route: rows.find((r) => r.unlocked && !r.done)?.route.title || ROUTES[0].title,
            }}
          >
            Записаться на открытый маршрут
          </BookButton>
          <a
            href={`tel:${SITE.phone.replace(/[^\d+]/g, "")}`}
            className="btn btn-ghost w-full sm:w-auto"
          >
            {SITE.phone}
          </a>
        </div>

        <div className="mt-10 grid gap-4">
          {rows.map(({ route, unlocked, done }) => (
            <article
              key={route.id}
              className={`card-dark p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4 ${
                unlocked ? "" : "opacity-60"
              }`}
            >
              <div className="flex-1 min-w-0">
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
              <div className="flex flex-wrap gap-2 shrink-0">
                {unlocked ? (
                  <BookButton
                    prefill={{ route: route.title, source: "lk_booking" }}
                    className="w-full sm:w-auto"
                  >
                    Забронировать
                  </BookButton>
                ) : (
                  <button
                    type="button"
                    className="btn btn-ghost opacity-50 cursor-not-allowed w-full sm:w-auto"
                    disabled
                  >
                    Закрыто
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
