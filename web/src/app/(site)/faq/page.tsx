"use client";

import { useState } from "react";
import { FAQ_ITEMS, IMAGES, SITE } from "@/data/site";
import { PageHero } from "@/components/ui/PageHero";
import { BookButton } from "@/components/ui/BookButton";

const TRUST = [
  "Безопасность",
  "Опытные инструкторы",
  "Живописные маршруты",
  "Простое бронирование",
  "Довольные гости",
];

export default function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <>
      <PageHero
        breadcrumbs={[
          { label: "Главная", href: "/" },
          { label: "FAQ" },
        ]}
        title="FAQ"
        subtitle="Ответы на частые вопросы"
        description="Коротко о безопасности, возрасте, экипировке и бронировании. Если не нашли ответ — напишите нам."
        image={IMAGES.heroFaq.src}
        imageAlt={IMAGES.heroFaq.alt}
      />

      <section className="bg-void border-y border-[var(--border-subtle)] py-8 md:py-10">
        <div className="container-site grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {TRUST.map((t) => (
            <div
              key={t}
              className="chip px-3 py-4 text-center text-[11px] sm:text-xs uppercase tracking-[0.08em] font-semibold text-ink"
            >
              {t}
            </div>
          ))}
        </div>
      </section>

      <section className="py-12 md:py-16 bg-base">
        <div className="container-site max-w-3xl">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className="faq-item">
                <button
                  type="button"
                  className="w-full flex items-start sm:items-center gap-3 sm:gap-4 p-4 sm:p-5 text-left min-h-[52px]"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span className="text-accent shrink-0 mt-0.5 text-sm" aria-hidden>
                    ◆
                  </span>
                  <span className="faq-q flex-1 text-[15px] sm:text-base leading-snug">
                    {item.q}
                  </span>
                  <span className="text-accent text-2xl leading-none shrink-0" aria-hidden>
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pl-10 sm:pl-12">
                    <p className="faq-a text-[15px] sm:text-base">{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="py-14 md:py-16 bg-void">
        <div className="container-site grid gap-8 md:grid-cols-[1.2fr_auto] md:items-center">
          <div>
            <h2 className="section-title text-[clamp(1.45rem,4vw,2.2rem)]">Остались вопросы?</h2>
            <div className="mt-4 flex flex-col gap-2 text-sm sm:text-base text-mute">
              <a
                href={`tel:${SITE.phone.replace(/[^\d+]/g, "")}`}
                className="text-ink hover:text-accent font-medium"
              >
                {SITE.phone}
              </a>
              <a href={`mailto:${SITE.email}`} className="hover:text-accent">
                {SITE.email}
              </a>
              <p>{SITE.hours}</p>
            </div>
          </div>
          <BookButton className="w-full sm:w-auto" prefill={{ source: "contact_faq" }}>
            Забронировать сейчас
          </BookButton>
        </div>
      </section>
    </>
  );
}
