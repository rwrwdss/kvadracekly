import type { Metadata } from "next";
import Link from "next/link";
import { IMAGES, SITE } from "@/data/site";
import { PageHero } from "@/components/ui/PageHero";
import { BookButton } from "@/components/ui/BookButton";

export const metadata: Metadata = { title: "Усадьба" };

export default function ManorPage() {
  return (
    <>
      <PageHero
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: "Усадьба" },
        ]}
        title="Усадьба «Берегиня»"
        subtitle="База Вольницы"
        description={`${SITE.location}. Старт и финиш всех маршрутов — здесь. После заезда — уют базы и природа.`}
        image={IMAGES.heroManor.src}
        imageAlt={IMAGES.heroManor.alt}
      />

      <section className="py-16 md:py-20">
        <div className="container-site grid gap-5 md:grid-cols-3">
          {[
            {
              t: "Старт маршрутов",
              d: "Выдача экипировки, инструктаж и выезд с территории усадьбы.",
            },
            {
              t: "После заезда",
              d: "Возврат на базу, осмотр техники. Можно остаться в атмосфере «Берегини».",
            },
            {
              t: "Пакетные предложения",
              d: "Связка проката с услугами усадьбы — уточняйте при бронировании.",
            },
          ].map((card) => (
            <article key={card.t} className="card-dark p-6">
              <h2 className="font-display uppercase tracking-wide text-lg text-accent">{card.t}</h2>
              <p className="mt-3 text-sm text-mute leading-relaxed">{card.d}</p>
            </article>
          ))}
        </div>

        <div className="container-site mt-12 flex flex-wrap gap-3">
          <BookButton prefill={{ source: "manor" }}>Забронировать выезд</BookButton>
          <Link href="/galereya" className="btn btn-ghost">
            Смотреть галерею
          </Link>
        </div>
      </section>
    </>
  );
}
