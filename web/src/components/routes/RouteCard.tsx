import Link from "next/link";
import { formatPrice, type Route } from "@/data/site";
import { BookButton } from "@/components/ui/BookButton";
import { difficultyClass } from "@/components/ui/PageHero";

export function RouteCard({ route }: { route: Route }) {
  return (
    <article className="card-dark overflow-hidden flex flex-col h-full">
      <div className="relative aspect-[16/10]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          role="img"
          aria-label={route.imageAlt}
          style={{ backgroundImage: `url(${route.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,15,12,0.95)] via-transparent to-transparent" />
        <span className={`badge absolute top-3 left-3 ${difficultyClass(route.difficulty)}`}>
          {route.difficultyLabel}
        </span>
        <span className="absolute bottom-3 right-3 text-accent font-semibold text-sm">
          {formatPrice(route.price)}
        </span>
      </div>
      <div className="p-5 flex flex-col flex-1 gap-3">
        <h3 className="font-display text-xl tracking-wide uppercase">{route.title}</h3>
        <p className="text-sm text-mute leading-relaxed flex-1">{route.description}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] uppercase tracking-wide text-faint border-y border-[var(--border-subtle)] py-3">
          <div className="flex justify-between sm:block gap-2">
            <div className="text-mute mb-0 sm:mb-1">Время</div>
            <div className="text-ink normal-case tracking-normal text-right sm:text-left">{route.duration}</div>
          </div>
          <div className="flex justify-between sm:block gap-2">
            <div className="text-mute mb-0 sm:mb-1">Дистанция</div>
            <div className="text-ink normal-case tracking-normal text-right sm:text-left">{route.distance}</div>
          </div>
          <div className="flex justify-between sm:block gap-2">
            <div className="text-mute mb-0 sm:mb-1">Для кого</div>
            <div className="text-ink normal-case tracking-normal text-right sm:text-left">{route.audience}</div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <Link href={`/marshruty#${route.slug}`} className="btn btn-ghost w-full !px-2">
            Подробнее
          </Link>
          <BookButton
            className="w-full !px-2"
            prefill={{ route: route.title, source: "route_select" }}
          >
            Выбрать
          </BookButton>
        </div>
      </div>
    </article>
  );
}
