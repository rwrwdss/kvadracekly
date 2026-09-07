"use client";

import React, { useEffect } from "react";

/** Заглушка: раздел галереи в админке отключён. */
export function GalleryAdminGone() {
  useEffect(() => {
    window.location.replace("/admin");
  }, []);

  return (
    <section className="catalog-layout-panel" style={{ margin: "1.5rem" }}>
      <h2 className="catalog-layout-panel__title">Раздел фото отключён</h2>
      <p className="catalog-layout-panel__lead">
        Управление фотографиями в админке убрано. Сейчас откроется главная админки…
      </p>
    </section>
  );
}
