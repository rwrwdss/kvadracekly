import type { Metadata } from "next";
import { formatPrice } from "@/data/site";
import { PageHero } from "@/components/ui/PageHero";
import { BookButton } from "@/components/ui/BookButton";
import { TariffsCarousel } from "@/components/tariffs/TariffsCarousel";
import { getTariffs } from "@/lib/cms/tariffs";
import { getCatalogPageLayout } from "@/lib/cms/catalogPages";
import {
  IconCamera,
  IconFuel,
  IconHelmet,
  IconHouse,
  IconMoon,
  IconRoute,
  IconUsers,
} from "@/components/ui/Icons";

export const metadata: Metadata = { title: "Тарифы" };
export const dynamic = "force-dynamic";

const CHIP_ICONS = [IconUsers, IconHelmet, IconFuel, IconRoute] as const;

const EXTRAS = [
  { t: "Пассажир на двухместной технике", price: "от 2 000 ₽", Icon: IconUsers },
  { t: "Индивидуальный маршрут", price: "по запросу", Icon: IconRoute },
  { t: "Фото / видео / GoPro", price: "от 1 500 ₽", Icon: IconCamera },
  { t: "Пакеты с усадьбой «Берегиня»", price: "по запросу", Icon: IconHouse },
] as const;

export default async function TariffsPage() {
  const [tariffs, layout] = await Promise.all([getTariffs(), getCatalogPageLayout("tariffs")]);

  return (
    <>
      <PageHero
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: "Тарифы" },
        ]}
        title={layout.title}
        subtitle={layout.subtitle}
        description={layout.description}
        image={layout.imageUrl}
        imageAlt={layout.imageAlt}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 max-w-3xl text-xs sm:text-sm">
          {layout.chips.map((t, i) => {
            const Icon = CHIP_ICONS[i % CHIP_ICONS.length];
            return (
              <div
                key={`${t}-${i}`}
                className="chip min-w-0 p-2.5 sm:p-3 text-ink flex items-center gap-2"
              >
                <span className="text-accent shrink-0">
                  <Icon size={16} />
                </span>
                <span className="leading-snug break-words">{t}</span>
              </div>
            );
          })}
        </div>
      </PageHero>

      <section className="py-14 sm:py-16 md:py-20">
        <div className="container-site grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,0.8fr)] lg:items-start">
          <div className="min-w-0">
            <p className="section-label mb-4 md:hidden">{layout.sectionLabel}</p>
            <TariffsCarousel routes={tariffs} />
          </div>

          <aside className="min-w-0 space-y-5">
            <div className="card-dark p-5 sm:p-6">
              <p className="section-label">Дополнительно</p>
              <ul className="mt-4 space-y-4">
                {EXTRAS.map(({ t, price, Icon }) => (
                  <li key={t} className="flex items-start gap-3 text-sm">
                    <span className="text-accent mt-0.5 shrink-0">
                      <Icon size={18} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-mute leading-snug">{t}</p>
                      <p className="mt-1 text-xs text-accent">{price}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card-dark p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <span className="text-accent">
                  <IconMoon size={20} />
                </span>
                <p className="section-label">Ночной квест</p>
              </div>
              <p className="mt-3 text-2xl text-accent font-semibold">{formatPrice(15000)}</p>
              <p className="text-sm text-mute mt-1">ориентир за двоих</p>
              <BookButton
                className="mt-5 w-full"
                prefill={{
                  route: "Ночной квест",
                  source: "tariff_night",
                  bookingKind: "night",
                }}
              >
                Оставить заявку
              </BookButton>
            </div>
            <div className="card-dark p-5 sm:p-6">
              <p className="section-label">Скидки</p>
              <p className="mt-3 text-sm text-mute leading-relaxed">
                Группам и постоянным гостям — уточняйте при бронировании. Прогресс маршрутов
                открывает следующие уровни в личном кабинете.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="py-14 sm:py-16 bg-void">
        <div className="container-site flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="section-title text-[clamp(1.45rem,4vw,2.2rem)]">{layout.ctaTitle}</h2>
            <p className="mt-3 text-sm text-mute">{layout.ctaText}</p>
          </div>
          <BookButton className="w-full md:w-auto" prefill={{ source: "tariff_help" }}>
            Подобрать тариф
          </BookButton>
        </div>
      </section>
    </>
  );
}
