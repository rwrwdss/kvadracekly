"use client";

import { CardCarousel } from "@/components/ui/CardCarousel";
import { BookButton } from "@/components/ui/BookButton";
import { IconCheck } from "@/components/ui/Icons";
import { difficultyClass } from "@/components/ui/PageHero";
import { useCustomerAuth } from "@/components/auth/CustomerAuthContext";
import { formatPrice } from "@/data/site";
import type { TariffCard } from "@/lib/cms/tariffs";

const INCLUDED = [
  "Маршрут с инструктором",
  "Базовая экипировка",
  "Техника и топливо в программе",
] as const;

export function TariffsCarousel({ routes }: { routes: TariffCard[] }) {
  const { user } = useCustomerAuth();
  const progress = user?.progress;

  return (
    <CardCarousel gridClassName="md:grid-cols-2">
      {routes.map((route) => {
        const unlocked = user
          ? route.progressOrder <= (progress?.unlockedOrder ?? 1)
          : true;
        const done = Boolean(user && progress && route.progressOrder <= progress.completedThrough);
        const badge = route.badge || "Тариф";

        return (
          <article
            key={route.id}
            className={`card-dark overflow-hidden flex flex-col h-full ${unlocked ? "" : "opacity-70"}`}
          >
            <div
              className="aspect-[16/9] bg-cover bg-center relative"
              role="img"
              aria-label={route.imageAlt}
              style={{ backgroundImage: `url(${route.image})` }}
            >
              <span className="absolute top-3 left-3 badge badge-medium">{badge}</span>
              {user && (
                <span
                  className={`absolute top-3 right-3 badge ${
                    done ? "badge-easy" : unlocked ? "badge-medium" : "badge-hard"
                  }`}
                >
                  {done ? "Пройден" : unlocked ? "Доступен" : "Закрыт"}
                </span>
              )}
            </div>
            <div className="p-5 flex flex-col flex-1 gap-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-xl uppercase tracking-wide">{route.title}</h3>
                <span className={`badge ${difficultyClass(route.difficulty)}`}>
                  {route.difficultyLabel}
                </span>
              </div>
              <p className="text-sm text-mute flex-1">{route.description}</p>
              {!user && (
                <p className="text-xs text-faint leading-relaxed">
                  Войдите, чтобы увидеть, какие маршруты открыты по вашему прогрессу.
                </p>
              )}
              {user && !unlocked && (
                <p className="text-xs text-faint leading-relaxed">
                  Откроется после прохождения предыдущего маршрута.
                </p>
              )}
              <div className="text-xs text-faint uppercase tracking-wide flex flex-wrap gap-x-3 gap-y-1">
                <span>{route.duration}</span>
                <span aria-hidden>·</span>
                <span>~{route.durationMinutes} мин</span>
                <span aria-hidden>·</span>
                <span>{route.distance}</span>
              </div>
              <ul className="text-sm text-mute space-y-2 border-t border-[var(--border-subtle)] pt-3">
                {INCLUDED.map((line) => (
                  <li key={line} className="flex items-start gap-2">
                    <span className="text-accent mt-0.5 shrink-0">
                      <IconCheck size={16} />
                    </span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between gap-3 pt-2">
                <p className="text-accent font-semibold text-lg">{formatPrice(route.price)}</p>
                {unlocked && route.activeForBooking ? (
                  <BookButton
                    className="!px-3"
                    prefill={{ route: route.title, tariff: badge, source: "tariff_select" }}
                  >
                    Выбрать
                  </BookButton>
                ) : (
                  <button
                    type="button"
                    className="btn btn-ghost !px-3 opacity-50 cursor-not-allowed"
                    disabled
                  >
                    {!route.activeForBooking ? "Скоро" : "Закрыто"}
                  </button>
                )}
              </div>
            </div>
          </article>
        );
      })}
    </CardCarousel>
  );
}
