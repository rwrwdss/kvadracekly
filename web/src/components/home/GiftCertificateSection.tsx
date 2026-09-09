import { IMAGES } from "@/data/site";

const FEATURES = [
  "Действителен в течение 3 месяцев",
  "Электронный или печатный формат",
  "Действует на все маршруты Вольницы",
] as const;

const STEPS = [
  "Выберите программу катания",
  "Оставьте контактные данные",
  "Оплатите сертификат",
] as const;

export function GiftCertificateSection() {
  return (
    <section
      className="gift-cert"
      aria-labelledby="gift-cert-title"
    >
      <div className="gift-cert__frame">
        <div className="gift-cert__media">
          <div
            className="gift-cert__photo"
            role="img"
            aria-label={IMAGES.giftCertificate.alt}
            style={{ backgroundImage: `url(${IMAGES.giftCertificate.src})` }}
          />
          <span className="gift-cert__badge">Подарочный сертификат</span>
        </div>

        <div className="gift-cert__body">
          <h2 id="gift-cert-title" className="gift-cert__title">
            Подарите <span>эмоции и драйв</span>
          </h2>
          <p className="gift-cert__lead">
            Сертификат на катание можно оформить удалённо — быстро и удобно. Идеальный
            подарок для тех, кто любит природу и адреналин.
          </p>

          <ul className="gift-cert__features">
            {FEATURES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <ol className="gift-cert__steps">
            {STEPS.map((step, i) => (
              <li key={step}>
                <span className="gift-cert__step-num" aria-hidden>
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>

          <a href="#zayavka" className="btn btn-primary gift-cert__cta">
            Оформить сертификат
            <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
