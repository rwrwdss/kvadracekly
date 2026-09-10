import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="text-xs text-faint tracking-wide mb-4" aria-label="Хлебные крошки">
      {items.map((item, i) => (
        <span key={item.label}>
          {i > 0 && <span className="mx-2 opacity-50">›</span>}
          {item.href ? (
            <Link href={item.href} className="hover:text-accent">
              {item.label}
            </Link>
          ) : (
            <span className="text-mute">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function PageHero({
  breadcrumbs,
  title,
  subtitle,
  description,
  image,
  imageAlt,
  children,
}: {
  breadcrumbs: { label: string; href?: string }[];
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  imageAlt?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative min-h-[48vh] sm:min-h-[52vh] md:min-h-[58vh] flex items-end">
      <div
        className="absolute inset-0 bg-cover bg-center"
        role="img"
        aria-label={imageAlt || title}
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="absolute inset-0 hero-overlay" />
      <div className="relative container-site pb-10 pt-24 sm:pb-12 sm:pt-28 md:pb-16 md:pt-32 w-full">
        <Breadcrumbs items={breadcrumbs} />
        <h1 className="section-title" data-reveal>
          {title}
        </h1>
        {subtitle && (
          <p
            className="section-label mt-3 drop-shadow"
            data-reveal
            style={{ "--reveal-delay": "0.32s" } as CSSProperties}
          >
            {subtitle}
          </p>
        )}
        {description && (
          <p
            className="mt-4 max-w-2xl text-mute text-[15px] sm:text-sm md:text-[1rem] leading-relaxed drop-shadow-[0_1px_8px_rgba(0,0,0,0.55)]"
            data-reveal
            style={{ "--reveal-delay": "0.5s" } as CSSProperties}
          >
            {description}
          </p>
        )}
        {children && (
          <div
            className="mt-6 sm:mt-8"
            data-reveal
            style={{ "--reveal-delay": "0.68s" } as CSSProperties}
          >
            {children}
          </div>
        )}
      </div>
    </section>
  );
}

export function IconStat({
  label,
  icon,
}: {
  label: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-accent mt-0.5 shrink-0">{icon}</span>
      <span className="text-sm text-mute leading-snug">{label}</span>
    </div>
  );
}

export function difficultyClass(d: "easy" | "medium" | "hard") {
  if (d === "easy") return "badge-easy";
  if (d === "hard") return "badge-hard";
  return "badge-medium";
}
