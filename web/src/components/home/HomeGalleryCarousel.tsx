"use client";

import { useEffect, useRef, useState } from "react";

type Item = { id: string; title: string; src: string; alt: string };

/** Горизонтальная карусель фото на главной (из CMS Галерея). */
export function HomeGalleryCarousel({ items }: { items: Item[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % items.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, [items.length]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || !items.length) return;
    const child = el.children[index] as HTMLElement | undefined;
    child?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [index, items.length]);

  if (!items.length) return null;

  return (
    <section className="py-14 sm:py-16 md:py-20 border-t border-[var(--border-subtle)]">
      <div className="container-site" data-reveal>
        <p className="section-label">Галерея</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <h2 className="section-title text-[clamp(1.35rem,3.5vw,2rem)]">Кадры с маршрутов</h2>
          <a href="/galereya" className="text-xs uppercase tracking-widest text-mute hover:text-accent">
            Вся галерея →
          </a>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="mt-8 flex gap-3 overflow-x-auto snap-x snap-mandatory hide-scrollbar px-4 sm:px-[max(1rem,calc((100vw-72rem)/2))]"
        aria-label="Карусель фото галереи"
        data-reveal="soft"
        style={{ ["--reveal-delay" as string]: "0.2s" }}
      >
        {items.map((item, i) => (
          <figure
            key={item.id}
            className={[
              "relative shrink-0 snap-center overflow-hidden border border-[var(--border-subtle)]",
              "w-[min(85vw,28rem)] aspect-[16/10] bg-elevated transition-opacity duration-500",
              i === index ? "opacity-100" : "opacity-70",
            ].join(" ")}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.src}
              alt={item.alt}
              className="absolute inset-0 h-full w-full object-cover"
              loading={i === 0 ? "eager" : "lazy"}
            />
            {item.title ? (
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 text-xs text-mute">
                {item.title}
              </figcaption>
            ) : null}
          </figure>
        ))}
      </div>

      {items.length > 1 ? (
        <div className="mt-4 flex justify-center gap-2" role="tablist" aria-label="Слайды">
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Слайд ${i + 1}`}
              className={[
                "h-1.5 w-1.5 rounded-full transition-colors",
                i === index ? "bg-accent" : "bg-white/25 hover:bg-white/45",
              ].join(" ")}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
