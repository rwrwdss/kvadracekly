"use client";

import { useState, type ComponentType, type SVGProps } from "react";
import { FAQ_ITEMS, IMAGES, SITE } from "@/data/site";
import { PageHero } from "@/components/ui/PageHero";
import { BookButton } from "@/components/ui/BookButton";
import {
  IconCalendar,
  IconCloud,
  IconGrad,
  IconHelmet,
  IconId,
  IconList,
  IconMoon,
  IconPhone,
  IconPin,
  IconShield,
  IconStar,
  IconTelegram,
  IconUsers,
  IconWallet,
  IconWhatsApp,
  IconWrench,
} from "@/components/ui/Icons";

type SvgIcon = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

const FAQ_ICONS: Record<(typeof FAQ_ITEMS)[number]["icon"], SvgIcon> = {
  id: IconId,
  users: IconUsers,
  grad: IconGrad,
  list: IconList,
  helmet: IconHelmet,
  cloud: IconCloud,
  wallet: IconWallet,
  calendar: IconCalendar,
  moon: IconMoon,
  wrench: IconWrench,
};

const TRUST: { label: string; Icon: SvgIcon }[] = [
  { label: "Безопасность", Icon: IconShield },
  { label: "Опытные инструкторы", Icon: IconHelmet },
  { label: "Живописные маршруты", Icon: IconPin },
  { label: "Простое бронирование", Icon: IconCalendar },
  { label: "Довольные гости", Icon: IconStar },
];

export default function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);
  const tel = SITE.phone.replace(/[^\d+]/g, "");

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
          {TRUST.map(({ label, Icon }) => (
            <div
              key={label}
              className="chip px-3 py-4 text-center flex flex-col items-center gap-2.5"
            >
              <span className="text-accent">
                <Icon size={22} />
              </span>
              <span className="text-[11px] sm:text-xs uppercase tracking-[0.08em] font-semibold text-ink leading-snug">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12 md:py-16 bg-canvas">
        <div className="container-site max-w-3xl">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = open === i;
            const Icon = FAQ_ICONS[item.icon];
            return (
              <div key={item.q} className="faq-item">
                <button
                  type="button"
                  className="w-full flex items-start sm:items-center gap-3 sm:gap-4 p-4 sm:p-5 text-left min-h-[52px]"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span className="text-accent shrink-0 mt-0.5" aria-hidden>
                    <Icon size={20} />
                  </span>
                  <span className="faq-q flex-1 text-[15px] sm:text-[1rem] leading-snug">
                    {item.q}
                  </span>
                  <span className="text-accent text-2xl leading-none shrink-0" aria-hidden>
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pl-11 sm:pl-14">
                    <p className="faq-a text-[15px] sm:text-[1rem]">{item.a}</p>
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
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={SITE.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="chip inline-flex items-center gap-2 px-4 py-3 text-sm text-ink hover:border-[var(--accent)] transition-colors"
              >
                <IconWhatsApp size={18} className="text-accent" />
                WhatsApp
              </a>
              <a
                href={`tel:${tel}`}
                className="chip inline-flex items-center gap-2 px-4 py-3 text-sm text-ink hover:border-[var(--accent)] transition-colors"
              >
                <IconPhone size={18} className="text-accent" />
                {SITE.phone}
              </a>
              <a
                href={SITE.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="chip inline-flex items-center gap-2 px-4 py-3 text-sm text-ink hover:border-[var(--accent)] transition-colors"
              >
                <IconTelegram size={18} className="text-accent" />
                Telegram
              </a>
            </div>
            <p className="mt-4 text-sm text-mute">{SITE.hours}</p>
          </div>
          <BookButton className="w-full sm:w-auto" prefill={{ source: "contact_faq" }}>
            Забронировать сейчас
          </BookButton>
        </div>
      </section>
    </>
  );
}
