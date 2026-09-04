import type { Metadata } from "next";
import { FLEET, IMAGES } from "@/data/site";
import { PageHero } from "@/components/ui/PageHero";
import { BookButton } from "@/components/ui/BookButton";

export const metadata: Metadata = { title: "Техника" };

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

      <section className="py-16 md:py-20">
        <div className="container-site">
          <p className="section-label">Наш парк</p>
          <h2 className="section-title mt-2 mb-10">8 единиц на старте</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FLEET.map((item) => (
              <article key={item.id} className="card-dark overflow-hidden">
                <div
                  className="aspect-[16/10] bg-cover bg-center"
                  role="img"
                  aria-label={item.imageAlt}
                  style={{ backgroundImage: `url(${item.image})` }}
                />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-xl uppercase tracking-wide">{item.name}</h3>
                    <span className="text-xs text-accent">×{item.count}</span>
                  </div>
                  <p className="mt-2 text-sm text-mute">{item.role}</p>
                  <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-wide text-faint">
                    <span>{item.color}</span>
                    <span>·</span>
                    <span>{item.seats} места</span>
                    <span>·</span>
                    <span>{item.drive}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Техника под задачу",
              "Проходимость 4×4",
              "Безопасность",
              "Дальние маршруты",
            ].map((t) => (
              <div key={t} className="border border-[var(--border-subtle)] p-4 text-sm text-mute">
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-void">
        <div className="container-site flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="section-title text-[clamp(1.5rem,3vw,2.2rem)]">Не знаете, что выбрать?</h2>
            <p className="mt-3 text-sm text-mute">
              Подберём технику под опыт и маршрут. В группе — машина инструктора.
            </p>
          </div>
          <BookButton prefill={{ source: "fleet_help" }}>Подобрать технику</BookButton>
        </div>
      </section>
    </>
  );
}
