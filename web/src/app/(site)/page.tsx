import Link from "next/link";
import { IMAGES, ROUTES, SITE } from "@/data/site";
import { BookButton } from "@/components/ui/BookButton";
import { RouteCard } from "@/components/routes/RouteCard";
import { HomeGalleryCarousel } from "@/components/home/HomeGalleryCarousel";
import { getHomeCarousel, getHomePageLayout } from "@/lib/cms/home";
import {
  IconAtv,
  IconClock,
  IconEngine,
  IconHouse,
  IconMoon,
  IconPin,
  IconRoute,
  IconShield,
  IconStar,
  IconTrees,
  IconUsers,
  IconHelmet,
} from "@/components/ui/Icons";

const HERO_FACT_ICONS = [IconPin, IconAtv, IconRoute, IconMoon] as const;

const INFO_CARDS = [
  {
    t: "Старт и финиш",
    d: "База КФХ, усадьба «Берегиня». Все маршруты с возвратом на базу.",
    Icon: IconHouse,
  },
  {
    t: "Режим работы",
    d: `${SITE.hours}. Ночные выезды — по записи.`,
    Icon: IconClock,
  },
  {
    t: "Форматы",
    d: "С инструктором в группе. Техника под уровень и маршрут.",
    Icon: IconHelmet,
  },
  {
    t: "Для кого",
    d: "Пары, семьи, компании, туристы и гости усадьбы.",
    Icon: IconUsers,
  },
] as const;

const WHY = [
  {
    t: "Безопасность",
    d: "Инструктаж, экипировка и исправная техника перед каждым выездом.",
    href: "/faq",
    image: IMAGES.heroHome.src,
    imageAlt: IMAGES.heroHome.alt,
    Icon: IconShield,
  },
  {
    t: "Авторские маршруты",
    d: "Озеро, памятник, родник, экспедиция — по сложности и прогрессу.",
    href: "/marshruty",
    image: "/images/routes/ozero-sosny-zakat.jpg",
    imageAlt: "Лесная тропа и озеро на маршрутах Вольницы",
    Icon: IconTrees,
  },
  {
    t: "Мощная техника",
    d: "8 квадроциклов: 4 грязевых и 4 прогулочных на старте.",
    href: "/tehnika",
    image: "/images/fleet/chernyj-kvadrocikl-gryaz-zakat.jpg",
    imageAlt: "Мощный квадроцикл в грязи на закате",
    Icon: IconEngine,
  },
  {
    t: "Усадьба «Берегиня»",
    d: "Уютная база после маршрута — природа и гостеприимство.",
    href: "/usadba",
    image: IMAGES.heroManor.src,
    imageAlt: IMAGES.heroManor.alt,
    Icon: IconHouse,
  },
] as const;

const STATS = [
  { n: "8", l: "квадроциклов", Icon: IconAtv },
  { n: "4", l: "авторских маршрута", Icon: IconPin },
  { n: "10–22", l: "режим работы", Icon: IconClock },
  { n: "1→4", l: "прогресс трасс", Icon: IconStar },
] as const;

export default async function HomePage() {
  const [hero, carousel] = await Promise.all([getHomePageLayout(), getHomeCarousel(12)]);

  return (
    <>
      <section className="relative min-h-[100svh] flex items-center grain">
        <div
          className="absolute inset-0 bg-cover bg-center"
          role="img"
          aria-label={hero.imageAlt}
          style={{ backgroundImage: `url(${hero.imageUrl})` }}
        />
        <div className="absolute inset-0 hero-overlay" />

        <div className="relative container-wide w-full pt-28 pb-16 md:pt-32 md:pb-20">
          <div className="hero-copy">
            <p className="hero-copy__eyebrow animate-fade-up">
              <span className="hero-copy__eyebrow-dot" aria-hidden />
              {hero.eyebrow}
            </p>
            <h1 className="hero-copy__title animate-fade-up-delay">
              <span className="hero-copy__title-line">{hero.titleLine1}</span>
              <span className="hero-copy__title-line">
                {hero.titleLine2.replace(/\s*Вольницей\.?\s*$/i, "").trim() || hero.titleLine2}
              </span>
              <span className="hero-copy__title-line hero-copy__title-line--brand">
                <span className="hero-copy__brand-script">Вольницей.</span>
              </span>
            </h1>
            <p className="hero-copy__tagline animate-fade-up-delay">
              {hero.tagline.split("\n").map((line, i, arr) => (
                <span
                  key={`${line}-${i}`}
                  className={`hero-copy__tagline-line${i === arr.length - 1 ? " hero-copy__tagline-line--accent" : ""}`}
                >
                  {line}
                </span>
              ))}
            </p>

            <div className="hero-copy__actions animate-fade-up-delay-2">
              <BookButton
                className="hero-copy__cta"
                variant="primary"
                prefill={{ source: "home_hero" }}
              >
                {hero.secondaryCtaLabel}
              </BookButton>
              <Link href="/marshruty" className="hero-copy__link">
                {hero.primaryCtaLabel}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {hero.facts.length > 0 ? (
        <section className="bg-void border-b border-[var(--border-subtle)]" aria-label="Коротко о формате">
          <div className="container-wide py-8 sm:py-10 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {hero.facts.map((text, i) => {
              const Icon = HERO_FACT_ICONS[i % HERO_FACT_ICONS.length];
              return (
                <div key={`${text}-${i}`} className="flex items-start gap-2.5 sm:gap-3">
                  <span className="text-accent shrink-0 mt-0.5">
                    <Icon size={22} />
                  </span>
                  <span className="text-xs sm:text-sm text-mute leading-snug uppercase tracking-wide">
                    {text}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="py-16 md:py-20 bg-void">
        <div className="container-site grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {INFO_CARDS.map(({ t, d, Icon }, i) => (
            <article key={t} className="card-dark p-5 sm:p-6 group">
              <span
                className="sticker-icon mb-4 inline-flex text-accent"
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                <Icon size={32} />
              </span>
              <h2 className="font-display tracking-wide uppercase text-lg">{t}</h2>
              <p className="mt-3 text-sm text-mute leading-relaxed">{d}</p>
            </article>
          ))}
        </div>
      </section>

      <HomeGalleryCarousel items={carousel} />

      <section className="py-16 md:py-24">
        <div className="container-site">
          <p className="section-label">Почему Вольница</p>
          <h2 className="section-title mt-2">Почему выбирают Вольницу</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {WHY.map((item) => (
              <article key={item.t} className="card-dark overflow-hidden flex flex-col group">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.04]"
                    role="img"
                    aria-label={item.imageAlt}
                    style={{ backgroundImage: `url(${item.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,15,12,0.92)] via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 grid h-9 w-9 place-items-center border border-[var(--accent-border)] bg-[rgba(10,15,12,0.55)] text-accent backdrop-blur-sm">
                    <item.Icon size={20} />
                  </span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-display uppercase tracking-wide text-accent">{item.t}</h3>
                  <p className="mt-3 text-sm text-mute leading-relaxed flex-1">{item.d}</p>
                  <Link
                    href={item.href}
                    className="inline-block mt-5 text-xs uppercase tracking-widest text-ink hover:text-accent"
                  >
                    Подробнее →
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 border border-[var(--border-subtle)] p-6 md:p-8">
            {STATS.map(({ n, l, Icon }) => (
              <div key={l} className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 text-accent mb-1">
                  <Icon size={18} />
                </div>
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
