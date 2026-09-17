import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/data/site";

export const metadata: Metadata = {
  title: "Спасибо за запись",
  description: "Заявка принята. Мы скоро свяжемся с вами.",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{
  kind?: string;
  route?: string;
  date?: string;
  guests?: string;
}>;

export default async function SpasiboPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const night = sp.kind === "night";
  const route = (sp.route || "").trim();
  const date = (sp.date || "").trim();
  const guestsRaw = Number(sp.guests || "");
  const guests = Number.isFinite(guestsRaw) && guestsRaw > 0 ? guestsRaw : null;
  const tel = SITE.phone.replace(/[^\d+]/g, "");

  return (
    <section className="relative flex-1 flex items-center justify-center py-16 md:py-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(212,164,90,0.18), transparent 60%)",
        }}
        aria-hidden
      />
      <div className="container-site relative w-full max-w-xl text-center">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center border border-[var(--accent-border)] text-accent text-3xl">
          ✓
        </div>
        <p className="section-label text-accent">Готово</p>
        <h1 className="mt-3 font-display text-2xl sm:text-3xl tracking-wide uppercase leading-tight">
          Спасибо за запись
        </h1>
        <p className="mt-3 text-lg text-ink/90">
          {night ? "Заявка принята" : "Вы в очереди"}
        </p>

        {(route || date || guests) && (
          <div className="mt-6 border border-[var(--border-subtle)] bg-elevated/60 px-5 py-4 text-sm text-mute space-y-1.5">
            {!night && date ? <p className="text-accent">{date}</p> : null}
            {route ? <p>{route}</p> : null}
            {guests ? <p>Гостей: {guests}</p> : null}
          </div>
        )}

        <p className="mt-5 text-sm text-mute leading-relaxed">
          {night
            ? "Напишем в выбранный мессенджер и согласуем дату выезда."
            : "Скоро свяжемся по указанному телефону."}
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
          <Link href="/" className="btn btn-primary">
            На главную
          </Link>
          <a href={`tel:${tel}`} className="btn btn-ghost">
            Позвонить {SITE.phone}
          </a>
        </div>
      </div>
    </section>
  );
}
