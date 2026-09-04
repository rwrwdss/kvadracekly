import type { Metadata } from "next";
import { IMAGES, NIGHT_QUEST, formatPrice } from "@/data/site";
import { PageHero } from "@/components/ui/PageHero";
import { BookButton } from "@/components/ui/BookButton";

export const metadata: Metadata = { title: "Ночной квест" };

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

      <section className="py-14 md:py-16 border-b border-[var(--border-subtle)]">
        <div className="container-site grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {NIGHT_QUEST.features.map((f) => (
            <div key={f} className="card-dark p-5 text-sm">
              <span className="text-accent">☾</span>
              <p className="mt-3 text-mute">{f}</p>
            </div>
          ))}
        </div>
        <div className="container-site mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm text-mute">
          {["Для новичков с инструктором", "Exclusive-формат", "Полная экипировка", "Безопасность"].map(
            (t) => (
              <div key={t} className="border border-[var(--border-subtle)] p-4">
                {t}
              </div>
            ),
          )}
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container-site">
          <p className="section-label">Программа</p>
          <h2 className="section-title mt-2 mb-10">Что вас ждёт?</h2>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {NIGHT_QUEST.awaits.map((item) => (
              <article key={item.title} className="card-dark p-6">
                <h3 className="font-display uppercase tracking-wide text-accent">{item.title}</h3>
                <p className="mt-3 text-sm text-mute">{item.text}</p>
              </article>
            ))}
          </div>

          <div className="mt-12 card-dark p-6 md:p-8 grid gap-6 md:grid-cols-[1.2fr_auto] md:items-center">
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
              <BookButton className="mt-4" prefill={{ route: "Ночной квест", source: "night_quest" }}>
                Забронировать квест
              </BookButton>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
