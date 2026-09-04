"use client";

import { useMemo, useState, type ComponentType } from "react";
import { Breadcrumbs } from "@/components/ui/PageHero";
import { BookButton } from "@/components/ui/BookButton";
import {
  IconAtv,
  IconCamera,
  IconHouse,
  IconList,
  IconMoon,
  IconRoute,
  IconTrees,
} from "@/components/ui/Icons";

type Item = {
  id: string;
  title: string;
  category: string;
  src: string;
  alt: string;
};

type Category = { id: string; label: string };

const CAT_ICONS: Record<string, ComponentType<{ size?: number }>> = {
  all: IconList,
  atv: IconAtv,
  routes: IconRoute,
  nature: IconTrees,
  night: IconMoon,
  manor: IconHouse,
};

export function GalleryClient({
  items,
  categories,
  intro,
}: {
  items: Item[];
  categories: readonly Category[] | Category[];
  intro: { title: string; subtitle: string; description: string };
}) {
  const [cat, setCat] = useState("all");

  const filtered = useMemo(
    () => (cat === "all" ? items : items.filter((g) => g.category === cat)),
    [cat, items],
  );

  return (
    <>
      <section className="pt-28 pb-10 md:pt-32">
        <div className="container-site">
          <Breadcrumbs
            items={[
              { label: "Главная", href: "/" },
              { label: "Галерея" },
            ]}
          />
          <h1 className="section-title text-[clamp(1.6rem,5vw,2.75rem)]">{intro.title}</h1>
          <p className="section-label mt-3">{intro.subtitle}</p>
          <p className="mt-4 max-w-2xl text-[15px] sm:text-sm text-mute leading-relaxed">
            {intro.description}
          </p>

          {items.length > 0 && (
            <div className="hide-scrollbar mt-8 -mx-4 px-4 flex gap-2 overflow-x-auto snap-x snap-mandatory pb-1 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible">
              {categories.map((c) => {
                const Icon = CAT_ICONS[c.id] ?? IconCamera;
                const active = cat === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCat(c.id)}
                    className={`btn !py-2 !px-3 shrink-0 snap-start inline-flex items-center gap-2 ${
                      active ? "btn-primary" : "btn-ghost"
                    }`}
                  >
                    <Icon size={16} />
                    <span>{c.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="pb-16 md:pb-20">
        <div className="container-site">
          {filtered.length === 0 ? (
            <div className="card-dark p-8 md:p-12 text-center max-w-2xl mx-auto">
              <p className="section-label">Пока пусто</p>
              <h2 className="font-display text-2xl uppercase tracking-wide mt-3">
                Живые фото появятся из CMS
              </h2>
              <p className="mt-4 text-mute text-sm leading-relaxed">
                Галерея показывает только реальные снимки, загруженные администратором в Payload
                (раздел «Галерея»). Плейсхолдеры и стоки здесь не используются.
              </p>
              <p className="mt-6 text-xs text-faint">
                Админка: <span className="text-accent">/admin</span> → Галерея → загрузить фото →
                Опубликовано
              </p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              {filtered.map((item, index) => (
                <figure
                  key={item.id}
                  className="break-inside-avoid overflow-hidden border border-[var(--border-subtle)] bg-card"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="w-full h-auto object-cover transition-transform duration-500 motion-safe:hover:scale-[1.02]"
                    style={{ aspectRatio: index % 3 === 1 ? "4/5" : "16/10" }}
                    loading="lazy"
                  />
                  {item.title && (
                    <figcaption className="p-3 text-xs text-mute">{item.title}</figcaption>
                  )}
                </figure>
              ))}
            </div>
          )}
        </div>

        <div className="container-site mt-14 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border border-[var(--border-subtle)] p-5 sm:p-6 md:p-8">
          <div>
            <p className="font-display text-xl uppercase tracking-wide">
              Каждый маршрут — новая история
            </p>
            <p className="mt-2 text-sm text-mute">Забронируйте выезд и соберите свои кадры.</p>
          </div>
          <BookButton className="w-full sm:w-auto" prefill={{ source: "gallery" }}>
            Забронировать сейчас
          </BookButton>
        </div>
      </section>
    </>
  );
}
