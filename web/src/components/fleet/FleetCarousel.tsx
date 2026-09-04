"use client";

import { CardCarousel } from "@/components/ui/CardCarousel";
import type { FleetItem } from "@/data/site";

export function FleetCarousel({ items }: { items: FleetItem[] }) {
  return (
    <CardCarousel
      gridClassName="sm:grid-cols-2 lg:grid-cols-3"
      mobileSlideClassName="w-[min(88vw,22rem)]"
    >
      {items.map((item) => (
        <article key={item.id} className="card-dark overflow-hidden h-full">
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
    </CardCarousel>
  );
}
