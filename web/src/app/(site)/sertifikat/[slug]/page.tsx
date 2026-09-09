import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";
import { SITE, ROUTES, IMAGES } from "@/data/site";
import { BookButton } from "@/components/ui/BookButton";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

async function getCertificate(slug: string) {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "gift-certificates",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });
  return result.docs[0] ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getCertificate(slug);
  if (!doc) return { title: "Сертификат не найден" };
  const name = doc.fullName || `${doc.firstName} ${doc.lastName}`;
  return {
    title: `Сертификат для ${name} · ${SITE.name}`,
    description: `Подарочный сертификат Вольницы на маршрут «${doc.routeTitle}».`,
  };
}

function formatDate(value?: string | null) {
  if (!value) return null;
  try {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return null;
  }
}

export default async function GiftCertificatePage({ params }: Props) {
  const { slug } = await params;
  const doc = await getCertificate(slug);
  if (!doc) notFound();

  const name = String(doc.fullName || `${doc.firstName} ${doc.lastName}`).trim();
  const route = ROUTES.find((r) => r.slug === doc.routeSlug);
  const validUntil = formatDate(doc.validUntil as string | null | undefined);
  const status = String(doc.status || "active");
  const inactive = status !== "active";

  return (
    <main className="cert-page">
      <div className="cert-page__stage">
        <article className={`cert-card${inactive ? " cert-card--inactive" : ""}`}>
          <div
            className="cert-card__bg"
            role="img"
            aria-label={IMAGES.giftCertificate.alt}
            style={{ backgroundImage: `url(${IMAGES.giftCertificate.src})` }}
          />
          <div className="cert-card__veil" />

          <div className="cert-card__content">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={SITE.logoFull}
              alt={SITE.logoFullAlt}
              width={180}
              height={150}
              className="cert-card__logo"
            />

            <p className="cert-card__eyebrow">Подарочный сертификат</p>
            <h1 className="cert-card__title">
              Для <span>{name}</span>
            </h1>
            <p className="cert-card__route">Маршрут «{doc.routeTitle}»</p>

            {route ? (
              <p className="cert-card__details">
                {route.duration} · {route.distance} · {route.price.toLocaleString("ru-RU")} ₽
              </p>
            ) : null}

            {validUntil ? (
              <p className="cert-card__valid">Действует до {validUntil}</p>
            ) : null}

            {inactive ? (
              <p className="cert-card__status">
                {status === "redeemed" ? "Сертификат уже использован" : "Сертификат недействителен"}
              </p>
            ) : (
              <p className="cert-card__hint">
                Покажите эту страницу при записи или оставьте заявку — подберём дату выезда.
              </p>
            )}

            <div className="cert-card__actions">
              {!inactive ? (
                <BookButton
                  prefill={{
                    source: `gift_cert_${slug}`,
                    route: String(doc.routeTitle),
                  }}
                >
                  Записаться по сертификату
                </BookButton>
              ) : null}
              <Link href="/" className="btn btn-ghost">
                На главную
              </Link>
            </div>

            <p className="cert-card__code">Код: {slug}</p>
          </div>
        </article>
      </div>
    </main>
  );
}
