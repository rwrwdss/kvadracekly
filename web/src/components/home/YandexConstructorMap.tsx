"use client";

import { useEffect, useRef } from "react";

const YANDEX_MAP_SRC =
  "https://api-maps.yandex.ru/services/constructor/1.0/js/?um=constructor%3A53cef481e80c519be569b9180af0d1b5708d3601e42a9d4fe6ff0d9151650683&width=100%25&height=400&lang=ru_RU&scroll=true";

/** Виджет конструктора Яндекс.Карт — скрипт вставляет карту в контейнер. */
export function YandexConstructorMap() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    host.replaceChildren();

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.charset = "utf-8";
    script.async = true;
    script.src = YANDEX_MAP_SRC;
    host.appendChild(script);

    return () => {
      host.replaceChildren();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className="find-us__map"
      role="region"
      aria-label="Карта проезда к Вольнице"
    />
  );
}
