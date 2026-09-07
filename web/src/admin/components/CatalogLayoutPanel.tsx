"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useAuth } from "@payloadcms/ui";
import {
  DEFAULT_PAGE_FLEET,
  DEFAULT_PAGE_TARIFFS,
  type CatalogPageDefaults,
} from "@/lib/cms/catalogPageDefaults";

type SeasonCurrent = "atv" | "snow" | "pause";

type PageForm = {
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  chipsText: string;
  sectionLabel: string;
  sectionTitle: string;
  ctaTitle: string;
  ctaText: string;
};

type SeasonForm = {
  current: SeasonCurrent;
  label: string;
  bannerText: string;
};

function chipsToText(chips: { label?: string | null }[] | string[] | null | undefined): string {
  if (!chips?.length) return "";
  return chips
    .map((c) => (typeof c === "string" ? c : String(c?.label || "").trim()))
    .filter(Boolean)
    .join("\n");
}

function textToChips(text: string): { label: string }[] {
  return text
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((label) => ({ label }));
}

function pageFromSettings(
  group: Record<string, unknown> | null | undefined,
  defaults: CatalogPageDefaults,
): PageForm {
  const chips = group?.chips as { label?: string | null }[] | undefined;
  return {
    title: String(group?.title || defaults.title),
    subtitle: String(group?.subtitle || defaults.subtitle),
    description: String(group?.description || defaults.description),
    imageUrl: String(group?.imageUrl || defaults.imageUrl),
    imageAlt: String(group?.imageAlt || defaults.imageAlt),
    chipsText: chipsToText(chips?.length ? chips : defaults.chips),
    sectionLabel: String(group?.sectionLabel || defaults.sectionLabel),
    sectionTitle: String(group?.sectionTitle || defaults.sectionTitle),
    ctaTitle: String(group?.ctaTitle || defaults.ctaTitle),
    ctaText: String(group?.ctaText || defaults.ctaText),
  };
}

type Props = { page: "tariffs" | "fleet" };

export function CatalogLayoutPanel({ page }: Props) {
  const { user } = useAuth();
  const role =
    user && typeof user === "object" && "role" in user
      ? String((user as { role?: string }).role || "")
      : "";
  const isAdmin = role === "admin";

  const defaults = page === "tariffs" ? DEFAULT_PAGE_TARIFFS : DEFAULT_PAGE_FLEET;
  const pageLabel = page === "tariffs" ? "Тарифы" : "Техника";
  const pagePath = page === "tariffs" ? "/tarify" : "/tehnika";

  const [season, setSeason] = useState<SeasonForm>({
    current: "atv",
    label: "Сезон квадроциклов",
    bannerText: "Сейчас сезон квадроциклов. Можно оставить заявку на ближайшие даты.",
  });
  const [layout, setLayout] = useState<PageForm>(() => pageFromSettings(null, defaults));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/catalog-layout", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка загрузки");

      const s = data.season || {};
      setSeason({
        current: (["atv", "snow", "pause"].includes(s.current) ? s.current : "atv") as SeasonCurrent,
        label: String(s.label || "Сезон квадроциклов"),
        bannerText: String(
          s.bannerText ||
            "Сейчас сезон квадроциклов. Можно оставить заявку на ближайшие даты.",
        ),
      });

      const group = page === "tariffs" ? data.pageTariffs : data.pageFleet;
      setLayout(pageFromSettings(group, defaults));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }, [defaults, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const seasonHint = useMemo(() => {
    if (season.current === "snow") return "Зимний режим: обновите тексты и фото героя под снегоходы.";
    if (season.current === "pause") return "Пауза: баннер может звать бронировать будущий сезон.";
    return "Летний/квадро режим. При смене на зиму поменяйте баннер и вёрстку ниже.";
  }, [season.current]);

  async function save() {
    if (!isAdmin) return;
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const body =
        page === "tariffs"
          ? {
              season,
              pageTariffs: {
                title: layout.title,
                subtitle: layout.subtitle,
                description: layout.description,
                imageUrl: layout.imageUrl,
                imageAlt: layout.imageAlt,
                chips: textToChips(layout.chipsText),
                sectionLabel: layout.sectionLabel,
                sectionTitle: layout.sectionTitle,
                ctaTitle: layout.ctaTitle,
                ctaText: layout.ctaText,
              },
            }
          : {
              season,
              pageFleet: {
                title: layout.title,
                subtitle: layout.subtitle,
                description: layout.description,
                imageUrl: layout.imageUrl,
                imageAlt: layout.imageAlt,
                chips: textToChips(layout.chipsText),
                sectionLabel: layout.sectionLabel,
                sectionTitle: layout.sectionTitle,
                ctaTitle: layout.ctaTitle,
                ctaText: layout.ctaText,
              },
            };

      const res = await fetch("/api/admin/catalog-layout", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Не удалось сохранить");
      }
      setMessage("Сохранено. Обновите страницу сайта, чтобы увидеть изменения.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  if (!isAdmin) return null;

  return (
    <section className="catalog-layout-panel">
      <div className="catalog-layout-panel__head">
        <div>
          <p className="catalog-layout-panel__eyebrow">Вёрстка и сезон</p>
          <h2 className="catalog-layout-panel__title">
            Баннер сезона и страница «{pageLabel}»
          </h2>
          <p className="catalog-layout-panel__lead">
            Здесь можно сменить сезон, текст полосы под шапкой и герой / CTA страницы{" "}
            <Link href={pagePath} prefetch={false}>
              {pagePath}
            </Link>
            . Карточки ниже — отдельные единицы каталога.
          </p>
        </div>
        <button
          type="button"
          className="catalog-layout-panel__toggle"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Свернуть" : "Развернуть"}
        </button>
      </div>

      {open ? (
        <>
          {loading ? <p className="catalog-layout-panel__mute">Загрузка…</p> : null}
          {error ? <p className="catalog-layout-panel__error">{error}</p> : null}
          {message ? <p className="catalog-layout-panel__ok">{message}</p> : null}

          <div className="catalog-layout-panel__grid">
            <fieldset className="catalog-layout-panel__box">
              <legend>Баннер сезона (весь сайт)</legend>
              <p className="catalog-layout-panel__hint">{seasonHint}</p>
              <label>
                <span>Текущий сезон</span>
                <select
                  value={season.current}
                  onChange={(e) =>
                    setSeason((s) => ({ ...s, current: e.target.value as SeasonCurrent }))
                  }
                >
                  <option value="atv">Квадроциклы</option>
                  <option value="snow">Снегоходы</option>
                  <option value="pause">Пауза / пересменка</option>
                </select>
              </label>
              <label>
                <span>Подпись</span>
                <input
                  value={season.label}
                  onChange={(e) => setSeason((s) => ({ ...s, label: e.target.value }))}
                  placeholder="Сезон снегоходов"
                />
              </label>
              <label>
                <span>Текст баннера</span>
                <textarea
                  rows={3}
                  value={season.bannerText}
                  onChange={(e) => setSeason((s) => ({ ...s, bannerText: e.target.value }))}
                  placeholder="Сейчас сезон снегоходов…"
                />
              </label>
            </fieldset>

            <fieldset className="catalog-layout-panel__box">
              <legend>Герой страницы «{pageLabel}»</legend>
              <label>
                <span>Заголовок</span>
                <input
                  value={layout.title}
                  onChange={(e) => setLayout((p) => ({ ...p, title: e.target.value }))}
                />
              </label>
              <label>
                <span>Подзаголовок</span>
                <input
                  value={layout.subtitle}
                  onChange={(e) => setLayout((p) => ({ ...p, subtitle: e.target.value }))}
                />
              </label>
              <label>
                <span>Описание</span>
                <textarea
                  rows={3}
                  value={layout.description}
                  onChange={(e) => setLayout((p) => ({ ...p, description: e.target.value }))}
                />
              </label>
              <label>
                <span>Картинка героя (путь)</span>
                <input
                  value={layout.imageUrl}
                  onChange={(e) => setLayout((p) => ({ ...p, imageUrl: e.target.value }))}
                  placeholder="/images/hero/...."
                />
              </label>
              <label>
                <span>Alt картинки</span>
                <input
                  value={layout.imageAlt}
                  onChange={(e) => setLayout((p) => ({ ...p, imageAlt: e.target.value }))}
                />
              </label>
              <label>
                <span>Чипы в герое (по одному в строке)</span>
                <textarea
                  rows={4}
                  value={layout.chipsText}
                  onChange={(e) => setLayout((p) => ({ ...p, chipsText: e.target.value }))}
                />
              </label>
            </fieldset>

            <fieldset className="catalog-layout-panel__box">
              <legend>Секция и CTA</legend>
              <label>
                <span>Лейбл секции</span>
                <input
                  value={layout.sectionLabel}
                  onChange={(e) => setLayout((p) => ({ ...p, sectionLabel: e.target.value }))}
                />
              </label>
              <label>
                <span>Заголовок секции</span>
                <input
                  value={layout.sectionTitle}
                  onChange={(e) => setLayout((p) => ({ ...p, sectionTitle: e.target.value }))}
                />
              </label>
              <label>
                <span>CTA: заголовок</span>
                <input
                  value={layout.ctaTitle}
                  onChange={(e) => setLayout((p) => ({ ...p, ctaTitle: e.target.value }))}
                />
              </label>
              <label>
                <span>CTA: текст</span>
                <textarea
                  rows={2}
                  value={layout.ctaText}
                  onChange={(e) => setLayout((p) => ({ ...p, ctaText: e.target.value }))}
                />
              </label>
            </fieldset>
          </div>

          <div className="catalog-layout-panel__actions">
            <button
              type="button"
              className="catalog-layout-panel__save"
              disabled={saving || loading}
              onClick={() => void save()}
            >
              {saving ? "Сохранение…" : "Сохранить вёрстку и баннер"}
            </button>
            <button type="button" className="catalog-layout-panel__reload" onClick={() => void load()}>
              Обновить
            </button>
            <Link href="/admin/globals/site-settings" prefetch={false}>
              Все настройки сайта →
            </Link>
          </div>
        </>
      ) : null}
    </section>
  );
}

export function TariffsLayoutPanel() {
  return <CatalogLayoutPanel page="tariffs" />;
}

export function FleetLayoutPanel() {
  return <CatalogLayoutPanel page="fleet" />;
}
