import { SITE } from "@/data/site";
import { IconClock, IconPin } from "@/components/ui/Icons";
import { YandexConstructorMap } from "@/components/home/YandexConstructorMap";

export function FindUsSection() {
  return (
    <section id="kak-nas-najti" className="find-us scroll-mt-28" aria-labelledby="find-us-title">
      <div className="container-site">
        <div className="find-us__head" data-reveal>
          <p className="section-label">Локация</p>
          <h2 id="find-us-title" className="section-title mt-2">
            Как нас найти
          </h2>
          <p className="find-us__lead">
            База Вольницы — усадьба «Берегиня». От Казани около 25–30 минут на машине.
          </p>
        </div>

        <div className="find-us__grid">
          <div className="find-us__info" data-reveal="soft">
            <div className="find-us__row">
              <span className="find-us__icon" aria-hidden>
                <IconPin size={22} />
              </span>
              <div>
                <p className="find-us__label">Адрес</p>
                <p className="find-us__value">{SITE.location}</p>
              </div>
            </div>
            <div className="find-us__row">
              <span className="find-us__icon" aria-hidden>
                <IconClock size={22} />
              </span>
              <div>
                <p className="find-us__label">Режим</p>
                <p className="find-us__value">{SITE.hours}</p>
              </div>
            </div>
            <a
              href={`tel:${SITE.phone.replace(/[^\d+]/g, "")}`}
              className="btn btn-ghost find-us__phone"
            >
              {SITE.phone}
            </a>
          </div>

          <div className="find-us__map-wrap">
            <YandexConstructorMap />
          </div>
        </div>
      </div>
    </section>
  );
}
