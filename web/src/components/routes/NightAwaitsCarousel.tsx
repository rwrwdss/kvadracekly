"use client";

import { CardCarousel } from "@/components/ui/CardCarousel";

type AwaitItem = {
  title: string;
  text: string;
  image: string;
  imageAlt: string;
};

export function NightAwaitsCarousel({ items }: { items: AwaitItem[] }) {
  return (
    <CardCarousel gridClassName="md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <article key={item.title} className="card-dark overflow-hidden h-full flex flex-col">
          <div
            className="aspect-[16/10] bg-cover bg-center"
            role="img"
            aria-label={item.imageAlt}
            style={{ backgroundImage: `url(${item.image})` }}
          />
          <div className="p-5 flex-1">
            <h3 className="font-display uppercase tracking-wide text-accent">{item.title}</h3>
            <p className="mt-3 text-sm text-mute leading-relaxed">{item.text}</p>
          </div>
        </article>
      ))}
    </CardCarousel>
  );
}
