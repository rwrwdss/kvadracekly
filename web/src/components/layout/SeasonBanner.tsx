import { getSeasonInfo } from "@/lib/cms/season";

/**
 * Полоса сезона строго под фиксированной шапкой (не внутри неё и не под прозрачным хедером).
 */
export async function SeasonBanner() {
  const season = await getSeasonInfo();
  if (!season.bannerText?.trim()) return null;

  const isPause = season.current === "pause";

  return (
    <div
      className={[
        // Отступ = высота fixed header (64/72), чтобы текст не просвечивал сквозь шапку
        "relative z-40 mt-[64px] sm:mt-[72px]",
        "border-b border-[var(--border-subtle)]",
        isPause ? "bg-[rgba(212,164,90,0.12)]" : "bg-[rgba(10,15,12,0.94)]",
      ].join(" ")}
      role="status"
    >
      <div className="container-site flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2 sm:py-2.5">
        <span className="shrink-0 text-[10px] sm:text-[11px] tracking-[0.14em] uppercase text-accent">
          {season.label}
        </span>
        <p className="m-0 min-w-0 text-xs sm:text-sm text-mute leading-snug">{season.bannerText}</p>
      </div>
    </div>
  );
}
