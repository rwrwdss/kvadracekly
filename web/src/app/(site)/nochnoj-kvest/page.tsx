import type { Metadata } from "next";
import { IMAGES, NIGHT_QUEST, formatPrice } from "@/data/site";
import { PageHero } from "@/components/ui/PageHero";
import { BookButton } from "@/components/ui/BookButton";
import { NightAwaitsCarousel } from "@/components/routes/NightAwaitsCarousel";
import {
  IconAtv,
  IconFire,
  IconHelmet,
  IconMoon,
  IconShield,
  IconStar,
  IconUsers,
} from "@/components/ui/Icons";

export const metadata: Metadata = { title: "Ночной квест" };

const FEATURE_ICONS = [IconMoon, IconStar, IconFire, IconAtv] as const;

const TRUST = [
  { t: "Для новичков с инструктором", Icon: IconUsers },
  { t: "Exclusive-формат", Icon: IconStar },
  { t: "Полная экипировка", Icon: IconHelmet },
  { t: "Безопасность", Icon: IconShield },
] as const;

export default function NightQuestPage() {
  return (
    <>
      <PageHero
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: "Ночной квест" },
        ]}
        title={NIGHT_QUEST.title}
        subtitle={NIGHT_QUEST.subtitle}
        description={NIGHT_QUEST.description}
        image={IMAGES.heroNight.src}
        imageAlt={IMAGES.heroNight.alt}
      />

      <section className="py-12 sm:py-14 md:py-16 border-b border-[var(--border-subtle)]">
        <div className="container-site grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {NIGHT_QUEST.features.map((f, i) => {
            const Icon = FEATURE_ICONS[i] ?? IconMoon;
            return (
              <div key={f} className="card-dark p-5 text-sm flex items-start gap-3">
                <span className="text-accent shrink-0 mt-0.5">
                  <Icon size={20} />
                </span>
                <p className="text-mute leading-relaxed">{f}</p>
              </div>
            );
          })}
        </div>
        <div className="container-site mt-4 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 text-sm text-mute">
          {TRUST.map(({ t, Icon }) => (
            <div
              key={t}
              className="border border-[var(--border-subtle)] p-4 flex items-center gap-3"
            >
              <span className="text-accent shrink-0">
                <Icon size={18} />
              </span>
              {t}
            </div>
          ))}
        </div>
      </section>

      <section className="py-14 sm:py-16 md:py-20">
        <div className="container-site">
          <p className="section-label">Программа</p>
          <h2 className="section-title mt-2 mb-8 sm:mb-10 text-[clamp(1.45rem,4vw,2.2rem)]">
            Что вас ждёт?
          </h2>
          <NightAwaitsCarousel items={NIGHT_QUEST.awaits} />

          <div className="mt-10 sm:mt-12 card-dark p-5 sm:p-6 md:p-8 grid gap-6 md:grid-cols-[1.2fr_auto] md:items-center">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-faint text-xs uppercase tracking-wide">Время</div>
                <div className="mt-1 text-mute">{NIGHT_QUEST.duration}</div>
              </div>
              <div>
                <div className="text-faint text-xs uppercase tracking-wide">Дистанция</div>
                <div className="mt-1 text-mute">{NIGHT_QUEST.distance}</div>
              </div>
              <div>
                <div className="text-faint text-xs uppercase tracking-wide">Уровень</div>
                <div className="mt-1 text-mute">{NIGHT_QUEST.level}</div>
              </div>
              <div>
                <div className="text-faint text-xs uppercase tracking-wide">Группа</div>
                <div className="mt-1 text-mute">{NIGHT_QUEST.group}</div>
              </div>
            </div>
            <div className="text-left md:text-right">
              <p className="text-2xl text-accent font-semibold">{formatPrice(NIGHT_QUEST.price)}</p>
              <p className="text-xs text-faint mt-1">{NIGHT_QUEST.priceNote}</p>
              <BookButton
                className="mt-4 w-full sm:w-auto"
                prefill={{ route: "Ночной квест", source: "night_quest" }}
              >
                Забронировать квест
              </BookButton>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
