import { ROUTES, type Route } from "@/data/site";

export const NIGHT_QUEST_TITLE = "Ночной квест";

/** Макс. progressOrder, который клиент уже прошёл (0 = ничего). */
export type ProgressInfo = {
  completedThrough: number;
  unlockedOrder: number;
  unlockedTitles: string[];
  doneTitles: string[];
};

export function clampCompletedThrough(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(4, Math.floor(n));
}

export function findRouteByTitle(title: string): Route | undefined {
  const t = title.trim().toLowerCase();
  if (!t) return undefined;
  return ROUTES.find((r) => r.title.toLowerCase() === t);
}

export function buildProgress(completedThroughRaw: unknown): ProgressInfo {
  const completedThrough = clampCompletedThrough(completedThroughRaw);
  const unlockedOrder = Math.min(4, completedThrough + 1);
  return {
    completedThrough,
    unlockedOrder,
    unlockedTitles: ROUTES.filter((r) => r.progressOrder <= unlockedOrder).map((r) => r.title),
    doneTitles: ROUTES.filter((r) => r.progressOrder <= completedThrough).map((r) => r.title),
  };
}

export function isRouteBookable(routeTitle: string, completedThrough: number): boolean {
  const title = routeTitle.trim();
  if (!title) return true; // «Подберём вместе»
  if (title === NIGHT_QUEST_TITLE) return true; // отдельный формат, не в цепочке дневных
  const route = findRouteByTitle(title);
  if (!route) return false;
  return route.progressOrder <= clampCompletedThrough(completedThrough) + 1;
}

export function bookableError(routeTitle: string, completedThrough: number): string | null {
  if (isRouteBookable(routeTitle, completedThrough)) return null;
  const route = findRouteByTitle(routeTitle);
  const prev = ROUTES.find((r) => r.progressOrder === (route?.progressOrder ?? 0) - 1);
  if (prev) {
    return `Маршрут «${routeTitle}» ещё закрыт. Сначала нужно пройти «${prev.title}» — менеджер отметит это в CRM.`;
  }
  return `Маршрут «${routeTitle}» ещё закрыт. Начните с «${ROUTES[0].title}».`;
}
