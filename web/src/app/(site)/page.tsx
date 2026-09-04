import Link from "next/link";
import { IMAGES, ROUTES, SITE } from "@/data/site";
import { BookButton } from "@/components/ui/BookButton";
import { RouteCard } from "@/components/routes/RouteCard";

export default function HomePage() {
  return (
    <>
      <section className="relative min-h-[100svh] flex items-end grain">
        <div
          className="absolute inset-0 bg-cover bg-center"
          role="img"
          aria-label={IMAGES.heroHome.alt}
          style={{ backgroundImage: `url(${IMAGES.heroHome.src})` }}
        />
        <div className="absolute inset-0 hero-overlay" />

        <div className="relative container-site w-full pb-20 pt-28 sm:pb-16 md:pb-24 md:pt-32">
          <p className="section-label animate-fade-up">Премиальный отдых на природе</p>
          <h1 className="font-display mt-3 text-[clamp(2.1rem,8vw,4.6rem)] leading-[0.95] tracking-[0.04em] uppercase animate-fade-up-delay">
            Прокат
            <br />
            квадроциклов
          </h1>
          <p className="mt-4 text-accent font-display text-base sm:text-lg md:text-xl tracking-[0.14em] sm:tracking-[0.2em] uppercase animate-fade-up-delay">
            {SITE.tagline}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-3 animate-fade-up-delay-2">
            <Link href="/marshruty" className="btn btn-primary w-full sm:w-auto">
              Выбрать маршрут →
            </Link>
            <BookButton
              className="w-full sm:w-auto"
              variant="ghost"
              prefill={{ source: "home_hero" }}
            >
              Забронировать
            </BookButton>
          </div>

          <div className="mt-10 sm:mt-12 md:mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 border-t border-[var(--border-subtle)] pt-6 sm:pt-8">
            {[
              "25–30 мин от Казани",
              "8 мощных квадроциклов",
              "Авторские маршруты",
              "Ночные выезды",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 sm:gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                <span className="text-xs sm:text-sm text-mute leading-snug">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-void">
        <div className="container-site grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              t: "Старт и финиш",
              d: "База КФХ, усадьба «Берегиня». Все маршруты с возвратом на базу.",
            },
            {
              t: "Режим работы",
              d: `${SITE.hours}. Ночные выезды — по записи.`,
            },
            {
              t: "Форматы",
              d: "С инструктором в группе. Техника под уровень и маршрут.",
            },
            {
              t: "Для кого",
              d: "Пары, семьи, компании, туристы и гости усадьбы.",
            },
          ].map((card) => (
            <article key={card.t} className="card-dark p-6">
              <div className="h-8 w-8 mb-4 border border-[var(--accent-border)] grid place-items-center text-accent text-xs">
                ◆
              </div>
              <h2 className="font-display tracking-wide uppercase text-lg">{card.t}</h2>
              <p className="mt-3 text-sm text-mute leading-relaxed">{card.d}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-site">
          <p className="section-label">Почему Вольница</p>
          <h2 className="section-title mt-2">Почему выбирают Вольницу</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                t: "Безопасность",
                d: "Инструктаж, экипировка и исправная техника перед каждым выездом.",
              },
              {
                t: "Авторские маршруты",
                d: "Озеро, памятник, родник, экспедиция — по сложности и прогрессу.",
              },
              {
                t: "Мощная техника",
                d: "8 квадроциклов: 4 грязевых и 4 прогулочных на старте.",
              },
              {
                t: "Усадьба «Берегиня»",
                d: "Уютная база после маршрута — природа и гостеприимство.",
              },
            ].map((item) => (
              <article key={item.t} className="card-dark p-6">
                <h3 className="font-display uppercase tracking-wide text-accent">{item.t}</h3>
                <p className="mt-3 text-sm text-mute leading-relaxed">{item.d}</p>
                <Link href="/marshruty" className="inline-block mt-5 text-xs uppercase tracking-widest text-ink hover:text-accent">
                  Подробнее →
                </Link>
              </article>
            ))}
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 border border-[var(--border-subtle)] p-6 md:p-8">
            {[
              ["8", "квадроциклов"],
              ["4", "авторских маршрута"],
              ["10–22", "режим работы"],
              ["1→4", "прогресс трасс"],
            ].map(([n, l]) => (
              <div key={l} className="text-center md:text-left">
                <div className="font-display text-3xl text-accent">{n}</div>
                <div className="mt-1 text-sm text-mute">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-void">
        <div className="container-site">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <p className="section-label">Маршруты</p>
              <h2 className="section-title mt-2">Выберите приключение</h2>
            </div>
            <Link href="/marshruty" className="btn btn-ghost">
              Все маршруты
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {ROUTES.map((route) => (
              <RouteCard key={route.id} route={route} />
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20 md:py-28">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          role="img"
          aria-label={IMAGES.heroRoutes.alt}
          style={{
            backgroundImage: `url(${IMAGES.heroRoutes.src})`,
          }}
        />
        <div className="absolute inset-0 bg-[rgba(4,6,5,0.82)]" />
        <div className="relative container-site text-center max-w-3xl mx-auto">
          <h2 className="section-title">Готовы к территории свободы?</h2>
          <p className="mt-4 text-mute">
            Оставьте заявку — подберём маршрут под ваш уровень и состав группы.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row flex-wrap justify-center gap-3">
            <BookButton className="w-full sm:w-auto" prefill={{ source: "home_bottom" }}>
              Забронировать сейчас
            </BookButton>
            <Link href="/faq" className="btn btn-ghost w-full sm:w-auto">
              Частые вопросы
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
