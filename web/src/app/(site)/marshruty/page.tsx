import type { Metadata } from "next";
import Link from "next/link";
import { IMAGES, ROUTES } from "@/data/site";
import { PageHero } from "@/components/ui/PageHero";
import { BookButton } from "@/components/ui/BookButton";
import { RoutesCarousel } from "@/components/routes/RoutesCarousel";
import { IconCamera, IconPin, IconShield, IconUsers } from "@/components/ui/Icons";

export const metadata: Metadata = { title: "Маршруты" };

const FEATURES = [
  { t: "Уникальные локации", Icon: IconPin },
  { t: "Фотостопы", Icon: IconCamera },
  { t: "Безопасность прежде всего", Icon: IconShield },
  { t: "Индивидуальный подход", Icon: IconUsers },
] as const;

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
        <a
          href="#karta"
          className="mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-accent hover:text-accent-hover"
        >
          Смотреть на карте ↓
        </a>
      </PageHero>

      <section className="py-14 sm:py-16 md:py-20">
        <div className="container-site">
          <div id="karta" className="mb-10 card-dark p-5 sm:p-6 md:p-8 scroll-mt-28">
            <p className="section-label">Единая карта</p>
            <h2 className="font-display text-[clamp(1.35rem,4vw,2rem)] uppercase tracking-wide mt-2">
              Все маршруты на одной карте
            </h2>
            <p className="mt-3 text-sm text-mute max-w-2xl leading-relaxed">
              Старт и финиш — КФХ. Точки: Зелёное озеро, карьер, пасека, смотровая, дом охотника,
              памятник, родник, Мономост и другие. Грязевые участки выделены отдельно. Маршруты
              конечные, с возвратом на базу.
            </p>
            <p className="mt-4 text-xs text-faint">
              Интерактивная карта появится после загрузки схемы от Заказчика.
            </p>
          </div>

          <RoutesCarousel routes={ROUTES} />

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
            <h2 className="section-title text-[clamp(1.45rem,4vw,2.2rem)]">
              Не нашли подходящий маршрут?
            </h2>
            <p className="mt-3 text-mute text-sm">Соберём индивидуальный под ваш уровень и компанию.</p>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full md:w-auto">
            <BookButton className="w-full sm:w-auto" prefill={{ source: "routes_custom" }}>
              Связаться
            </BookButton>
            <Link href="/lk" className="btn btn-ghost w-full sm:w-auto">
              Личный кабинет
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
