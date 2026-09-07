import { getSeasonInfo } from "@/lib/cms/season";

/** Баннер текущего сезона / паузы — под шапкой, не в герое. */
export async function SeasonBanner() {
  const season = await getSeasonInfo();
  if (!season.bannerText?.trim()) return null;

  const isPause = season.current === "pause";

  return (
    <div
      className={[
        "border-b border-[var(--border-subtle)]",
        isPause ? "bg-[rgba(212,164,90,0.08)]" : "bg-card/40",
      ].join(" ")}
      role="status"
    >
      <div className="container-site py-2.5 sm:py-3 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 text-sm">
        <span className="section-label shrink-0 !mb-0 text-[10px] sm:text-[11px]">
          {season.label}
        </span>
        <p className="text-mute leading-relaxed m-0">{season.bannerText}</p>
      </div>
    </div>
  );
}
