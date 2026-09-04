import type { Metadata } from "next";
import { FLEET, IMAGES } from "@/data/site";
import { PageHero } from "@/components/ui/PageHero";
import { BookButton } from "@/components/ui/BookButton";
import { FleetCarousel } from "@/components/fleet/FleetCarousel";
import { IconAtv, IconEngine, IconRoute, IconShield } from "@/components/ui/Icons";

export const metadata: Metadata = { title: "Техника" };

const FEATURES = [
  { t: "Техника под задачу", Icon: IconAtv },
  { t: "Проходимость 4×4", Icon: IconEngine },
  { t: "Безопасность", Icon: IconShield },
  { t: "Дальние маршруты", Icon: IconRoute },
] as const;

export default function FleetPage() {
  return (
    <>
      <PageHero
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: "Техника" },
        ]}
        title="Наша техника"
        subtitle="Мощные. Надёжные. Готовые к приключениям"
        description="На старте 8 квадроциклов: 4 грязевых и 4 прогулочных. Перед каждым выездом — подготовка, ТО и инструктаж."
        image={IMAGES.heroFleet.src}
        imageAlt={IMAGES.heroFleet.alt}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl text-xs sm:text-sm">
          {["Подготовка", "ТО и осмотр", "Экипировка", "Подбор под маршрут"].map((t) => (
            <div key={t} className="chip p-3 text-ink">
              {t}
            </div>
          ))}
        </div>
      </PageHero>

      <section className="py-14 sm:py-16 md:py-20">
        <div className="container-site">
          <p className="section-label">Наш парк</p>
          <h2 className="section-title mt-2 mb-8 sm:mb-10 text-[clamp(1.45rem,4vw,2.2rem)]">
            8 единиц на старте
          </h2>
          <FleetCarousel items={FLEET} />

          <div className="mt-10 sm:mt-12 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ t, Icon }) => (
              <div
                key={t}
                className="flex items-center gap-3 text-sm text-mute border border-[var(--border-subtle)] p-4"
              >
                <span className="text-accent shrink-0">
                  <Icon size={20} />
                </span>
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-16 bg-void">
        <div className="container-site flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="section-title text-[clamp(1.45rem,4vw,2.2rem)]">Не знаете, что выбрать?</h2>
            <p className="mt-3 text-sm text-mute">
              Подберём технику под опыт и маршрут. В группе — машина инструктора.
            </p>
          </div>
          <BookButton className="w-full md:w-auto" prefill={{ source: "fleet_help" }}>
            Подобрать технику
          </BookButton>
        </div>
      </section>
    </>
  );
}
