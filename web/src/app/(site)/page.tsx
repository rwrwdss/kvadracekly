import Link from "next/link";
import type { CSSProperties } from "react";
import { IMAGES, ROUTES, SITE } from "@/data/site";
import { BookButton } from "@/components/ui/BookButton";
import { RouteCard } from "@/components/routes/RouteCard";
import { HomeGalleryCarousel } from "@/components/home/HomeGalleryCarousel";
import { GiftCertificateSection } from "@/components/home/GiftCertificateSection";
import { FindUsSection } from "@/components/home/FindUsSection";
import { getHomeCarousel, getHomePageLayout } from "@/lib/cms/home";
import {
  IconAtv,
  IconClock,
  IconHouse,
  IconMoon,
  IconPin,
  IconRoute,
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

const WHY_CHOOSE = [
  {
    t: "Душ после проката",
    d: "После заезда можно принять душ на базе и не ехать домой в грязи.",
  },
  {
    t: "Баня по заказу",
    d: "Баню можно заказать отдельно — сразу после маршрута, пока ещё на усадьбе.",
  },
  {
    t: "25–30 минут от Казани",
    d: "База усадьбы «Берегиня» рядом с городом, без долгой дороги.",
  },
  {
    t: "Инструктор и экипировка",
    d: "Перед выездом — инструктаж, шлем и техника под ваш уровень.",
  },
  {
    t: "Дети с 6 лет",
    d: "Катаются пары, семьи и компании. Детям — с шести лет.",
  },
  {
    t: "Возврат на базу",
    d: "Все маршруты стартуют и заканчиваются на территории усадьбы.",
  },
  {
    t: "Ночные выезды",
    d: "Дневные заезды по расписанию, ночные — по записи.",
  },
] as const;

export const revalidate = 60;

export default async function HomePage() {
  const [hero, carousel] = await Promise.all([getHomePageLayout(), getHomeCarousel(12)]);

  return (
    <>
      <section className="relative min-h-[100svh] flex items-center grain">
        {hero.mediaType === "video" && hero.videoUrl ? (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={hero.imageUrl || undefined}
            aria-label={hero.imageAlt}
          >
            <source src={hero.videoUrl} type="video/mp4" />
          </video>
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center"
            role="img"
            aria-label={hero.imageAlt}
            style={{ backgroundImage: `url(${hero.imageUrl})` }}
          />
        )}
        <div className="absolute inset-0 hero-overlay" />

        <div className="relative container-wide w-full pt-28 pb-[calc(7.5rem+env(safe-area-inset-bottom,0px))] md:pt-32 md:pb-20">
          <div className="hero-copy">
            <p className="hero-copy__eyebrow hero-reveal hero-reveal--1">
              <span className="hero-copy__eyebrow-dot" aria-hidden />
              {hero.eyebrow}
            </p>
            <h1 className="hero-copy__title">
              <span className="hero-copy__title-line hero-reveal hero-reveal--2">
                {hero.titleLine1}
              </span>
              <span className="hero-copy__title-line hero-reveal hero-reveal--3">
                {hero.titleLine2.replace(/\s*Вольницей\.?\s*$/i, "").trim() || hero.titleLine2}{" "}
                <span className="hero-copy__brand-script">Вольницей.</span>
              </span>
            </h1>
            <p className="hero-copy__tagline hero-reveal hero-reveal--4">
              {hero.tagline.split("\n").map((line, i, arr) => (
                <span
                  key={`${line}-${i}`}
                  className={`hero-copy__tagline-line${i === arr.length - 1 ? " hero-copy__tagline-line--accent" : ""}`}
                >
                  {line}
                </span>
              ))}
            </p>

            <div className="hero-copy__actions hero-reveal hero-reveal--5">
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

      <section className="age-widget" aria-label="Возраст для детей">
        <div className="container-wide">
          <div className="age-widget__inner" data-reveal="soft">
            <span className="age-widget__mark">6+</span>
            <p className="age-widget__text">возраст, с которого катаются дети</p>
          </div>
        </div>
      </section>

      {hero.facts.length > 0 ? (
        <section className="bg-void border-b border-[var(--border-subtle)]" aria-label="Коротко о формате">
          <div className="container-wide py-8 sm:py-10 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {hero.facts.map((text, i) => {
              const Icon = HERO_FACT_ICONS[i % HERO_FACT_ICONS.length];
              return (
                <div
                  key={`${text}-${i}`}
                  className="flex items-start gap-2.5 sm:gap-3"
                  data-reveal="soft"
                  style={{ "--reveal-delay": `${0.1 + i * 0.14}s` } as CSSProperties}
                >
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
            <article
              key={t}
              className="card-dark p-5 sm:p-6 group"
              data-reveal="up"
              style={{ "--reveal-delay": `${0.12 + i * 0.16}s` } as CSSProperties}
            >
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

      <section className="why-choose" aria-labelledby="why-choose-title">
        <div className="container-site why-choose__grid">
          <div className="why-choose__intro" data-reveal>
            <p className="section-label">После маршрута и не только</p>
            <h2 id="why-choose-title" className="section-title mt-2">
              Почему выбирают нас
            </h2>
            <p className="why-choose__lead">
              Трасса — не всё. На базе можно привести себя в порядок, заказать баню и не торопиться обратно в город.
            </p>
          </div>
          <ol className="why-choose__list">
            {WHY_CHOOSE.map((item, i) => (
              <li
                key={item.t}
                data-reveal="up"
                style={{ "--reveal-delay": `${0.08 + i * 0.08}s` } as CSSProperties}
              >
                <span className="why-choose__index" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{item.t}</h3>
                  <p>{item.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <HomeGalleryCarousel items={carousel} />

      <section className="py-16 md:py-24 bg-void">
        <div className="container-site">
          <div
            className="flex flex-wrap items-end justify-between gap-4 mb-10"
            data-reveal
          >
            <div>
              <p className="section-label">Маршруты</p>
              <h2 className="section-title mt-2">Выберите приключение</h2>
            </div>
            <Link href="/marshruty" className="btn btn-ghost">
              Все маршруты
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {ROUTES.map((route, i) => (
              <div
                key={route.id}
                data-reveal="up"
                style={{ "--reveal-delay": `${0.1 + i * 0.14}s` } as CSSProperties}
              >
                <RouteCard route={route} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <GiftCertificateSection />

      <FindUsSection />

      <section id="zayavka" className="relative py-20 md:py-28 scroll-mt-28">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          role="img"
          aria-label={IMAGES.heroRoutes.alt}
          style={{
            backgroundImage: `url(${IMAGES.heroRoutes.src})`,
          }}
        />
        <div className="absolute inset-0 bg-[rgba(4,6,5,0.82)]" />
        <div className="relative container-site text-center max-w-3xl mx-auto" data-reveal>
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
