import type { Metadata } from "next";
import { IMAGES, ROUTES, formatPrice } from "@/data/site";
import { PageHero, difficultyClass } from "@/components/ui/PageHero";
import { BookButton } from "@/components/ui/BookButton";

export const metadata: Metadata = { title: "Тарифы" };

const badgeMap = ["Стандарт", "Премиум", "Премиум+", "Легенда"] as const;

export default function TariffsPage() {
  return (
    <>
      <PageHero
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: "Тарифы" },
        ]}
        title="Тарифы и услуги"
        subtitle="Выберите формат приключения"
        description="Цена указана за клиентский квадроцикл. В группе резервируется машина инструктора."
        image={IMAGES.heroTariffs.src}
        imageAlt={IMAGES.heroTariffs.alt}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl text-xs sm:text-sm">
          {["Инструктор", "Экипировка", "Топливо", "Маршрут"].map((t) => (
            <div key={t} className="chip p-3 text-ink">
              {t}
            </div>
          ))}
        </div>
      </PageHero>

      <section className="py-16 md:py-20">
        <div className="container-site grid gap-8 lg:grid-cols-[1.6fr_0.8fr]">
          <div className="grid gap-5 md:grid-cols-2">
            {ROUTES.map((route, i) => (
              <article key={route.id} className="card-dark overflow-hidden flex flex-col">
                <div
                  className="aspect-[16/9] bg-cover bg-center relative"
                  role="img"
                  aria-label={route.imageAlt}
                  style={{ backgroundImage: `url(${route.image})` }}
                >
                  <span className="absolute top-3 left-3 badge badge-medium">{badgeMap[i]}</span>
                </div>
                <div className="p-5 flex flex-col flex-1 gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-xl uppercase tracking-wide">{route.title}</h3>
                    <span className={`badge ${difficultyClass(route.difficulty)}`}>
                      {route.difficultyLabel}
                    </span>
                  </div>
                  <p className="text-sm text-mute flex-1">{route.description}</p>
                  <div className="text-xs text-faint uppercase tracking-wide flex gap-3">
                    <span>{route.duration}</span>
                    <span>·</span>
                    <span>{route.distance}</span>
                  </div>
                  <ul className="text-sm text-mute space-y-1 border-t border-[var(--border-subtle)] pt-3">
                    <li>✓ Маршрут с инструктором</li>
                    <li>✓ Базовая экипировка</li>
                    <li>✓ Техника и топливо в программе</li>
                  </ul>
                  <div className="flex items-center justify-between gap-3 pt-2">
                    <p className="text-accent font-semibold text-lg">{formatPrice(route.price)}</p>
                    <BookButton
                      className="!px-3"
                      prefill={{ route: route.title, tariff: badgeMap[i], source: "tariff_select" }}
                    >
                      Выбрать
                    </BookButton>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="space-y-5">
            <div className="card-dark p-6">
              <p className="section-label">Дополнительно</p>
              <ul className="mt-4 space-y-3 text-sm text-mute">
                <li>Пассажир на двухместной технике</li>
                <li>Индивидуальный маршрут</li>
                <li>Фото / видео / GoPro</li>
                <li>Пакеты с усадьбой «Берегиня»</li>
              </ul>
            </div>
            <div className="card-dark p-6">
              <p className="section-label">Ночной квест</p>
              <p className="mt-3 text-2xl text-accent font-semibold">15 000 ₽</p>
              <p className="text-sm text-mute mt-1">ориентир за двоих</p>
              <BookButton className="mt-5 w-full" prefill={{ route: "Ночной квест", source: "tariff_night" }}>
                Забронировать квест
              </BookButton>
            </div>
            <div className="card-dark p-6">
              <p className="section-label">Скидки</p>
              <p className="mt-3 text-sm text-mute">
                Группам и постоянным гостям — уточняйте при бронировании. Прогресс маршрутов
                открывает следующие уровни в личном кабинете.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="py-16 bg-void">
        <div className="container-site flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="section-title text-[clamp(1.5rem,3vw,2.2rem)]">Не можете выбрать?</h2>
            <p className="mt-3 text-sm text-mute">Подскажем тариф под опыт и состав группы.</p>
          </div>
          <BookButton prefill={{ source: "tariff_help" }}>Подобрать тариф</BookButton>
        </div>
      </section>
    </>
  );
}
