"use client";

import { CardCarousel } from "@/components/ui/CardCarousel";
import { RouteCard } from "@/components/routes/RouteCard";
import type { Route } from "@/data/site";

export function RoutesCarousel({ routes }: { routes: Route[] }) {
  return (
    <CardCarousel gridClassName="md:grid-cols-2 xl:grid-cols-3">
      {routes.map((route) => (
        <div key={route.id} id={route.slug} className="h-full">
          <RouteCard route={route} />
        </div>
      ))}
    </CardCarousel>
  );
}
