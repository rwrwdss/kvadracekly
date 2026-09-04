import type { Metadata } from "next";
import Link from "next/link";
import { IMAGES, ROUTES } from "@/data/site";
import { PageHero } from "@/components/ui/PageHero";
import { RouteCard } from "@/components/routes/RouteCard";
import { BookButton } from "@/components/ui/BookButton";

export const metadata: Metadata = { title: "Маршруты" };

export default function RoutesPage() {
  return (
    <>
      <PageHero
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: "Маршруты" },
        ]}
        title="Наши маршруты"
        subtitle="Авторские тропы для любого уровня"
        description="Четыре дневных маршрута по сложности. Новый клиент в личном кабинете начинает с «Зелёного озера» — дальше трассы открываются по порядку."
        image={IMAGES.heroRoutes.src}
        imageAlt={IMAGES.heroRoutes.alt}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl">
          {["4 авторских маршрута", "45 мин – 2+ ч", "Разная сложность", "Фотостопы"].map(
            (t) => (
              <div key={t} className="chip text-xs sm:text-sm p-3 text-ink">
                {t}
              </div>
            ),
          )}
        </div>
      </PageHero>

      <section className="py-16 md:py-20">
        <div className="container-site">
          <div className="mb-10 card-dark p-6 md:p-8">
            <p className="section-label">Единая карта</p>
            <h2 className="font-display text-2xl uppercase tracking-wide mt-2">
              Все маршруты на одной карте
            </h2>
            <p className="mt-3 text-sm text-mute max-w-2xl">
              Старт и финиш — КФХ. Точки: Зелёное озеро, карьер, пасека, смотровая,
              дом охотника, памятник, родник, Мономост и другие. Грязевые участки
              выделены отдельно. Маршруты конечные, с возвратом на базу.
            </p>
            <p className="mt-4 text-xs text-faint">
              Интерактивная карта появится после загрузки схемы от Заказчика.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {ROUTES.map((route) => (
              <div key={route.id} id={route.slug}>
                <RouteCard route={route} />
              </div>
            ))}
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Уникальные локации",
              "Фотостопы",
              "Безопасность прежде всего",
              "Индивидуальный подход",
            ].map((t) => (
              <div
                key={t}
                className="flex items-center gap-3 text-sm text-mute border border-[var(--border-subtle)] p-4"
              >
                <span className="text-accent">✦</span>
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-void">
        <div className="container-site flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="section-title text-[clamp(1.5rem,3vw,2.2rem)]">
              Не нашли подходящий маршрут?
            </h2>
            <p className="mt-3 text-mute text-sm">Соберём индивидуальный под ваш уровень и компанию.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <BookButton prefill={{ source: "routes_custom" }}>Связаться</BookButton>
            <Link href="/lk" className="btn btn-ghost">
              Личный кабинет
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
