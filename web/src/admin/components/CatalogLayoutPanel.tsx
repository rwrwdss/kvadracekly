"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Link } from "@payloadcms/ui";
import {
  DEFAULT_PAGE_FLEET,
  DEFAULT_PAGE_TARIFFS,
  type CatalogPageDefaults,
} from "@/lib/cms/catalogPageDefaults";
import { AdminImagePathInput } from "./AdminImageThumb";

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

/** Лёгкая панель текстов страницы Тарифы / Техника. */
export function CatalogLayoutPanel({ page }: Props) {
  const defaults = page === "tariffs" ? DEFAULT_PAGE_TARIFFS : DEFAULT_PAGE_FLEET;
  const pageLabel = page === "tariffs" ? "Тарифы" : "Техника";
  const pagePath = page === "tariffs" ? "/tarify" : "/tehnika";

  const [layout, setLayout] = useState<PageForm>(() => pageFromSettings(null, defaults));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/admin/catalog-layout", { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Не удалось загрузить тексты");
      const group = page === "tariffs" ? data.pageTariffs : data.pageFleet;
      setLayout(pageFromSettings(group, defaults));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, [defaults, page]);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const pagePayload = {
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
      };
      const body =
        page === "tariffs" ? { pageTariffs: pagePayload } : { pageFleet: pagePayload };

      const res = await fetch("/api/admin/catalog-layout", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Не удалось сохранить");
      setMessage("Сохранено — обновите страницу сайта (F5).");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="catalog-layout-panel catalog-layout-panel--slim">
      <div className="catalog-layout-panel__head">
        <div>
          <p className="catalog-layout-panel__eyebrow">Тексты страницы</p>
          <h2 className="catalog-layout-panel__title">«{pageLabel}» на сайте</h2>
          <p className="catalog-layout-panel__lead">
            Меняйте тексты и нажмите «Сохранить». Карточки ниже — отдельные позиции каталога. Сайт:{" "}
            <Link href={pagePath} prefetch={false}>
              {pagePath}
            </Link>
          </p>
        </div>
      </div>

      {loading ? <p className="catalog-layout-panel__mute">Загрузка…</p> : null}
      {error ? <p className="catalog-layout-panel__error">{error}</p> : null}
      {message ? <p className="catalog-layout-panel__ok">{message}</p> : null}

      <div className="catalog-layout-panel__slim-grid">
        <label>
          <span>Главный заголовок</span>
          <input
            value={layout.title}
            onChange={(e) => setLayout((p) => ({ ...p, title: e.target.value }))}
            disabled={loading}
          />
        </label>
        <label>
          <span>Подзаголовок</span>
          <input
            value={layout.subtitle}
            onChange={(e) => setLayout((p) => ({ ...p, subtitle: e.target.value }))}
            disabled={loading}
          />
        </label>
        <label>
          <span>Текст под заголовком</span>
          <textarea
            rows={2}
            value={layout.description}
            onChange={(e) => setLayout((p) => ({ ...p, description: e.target.value }))}
            disabled={loading}
          />
        </label>
        <AdminImagePathInput
          label="Картинка фона"
          value={layout.imageUrl}
          onChange={(imageUrl) => setLayout((p) => ({ ...p, imageUrl }))}
          hint="Запасной путь /images/…"
          replaceLabel="Заменить фотографию"
          altForUpload="Фон страницы каталога"
        />
        <label>
          <span>Короткие подписи (по строке)</span>
          <textarea
            rows={3}
            value={layout.chipsText}
            onChange={(e) => setLayout((p) => ({ ...p, chipsText: e.target.value }))}
            disabled={loading}
          />
        </label>
        <label>
          <span>Заголовок над списком</span>
          <input
            value={layout.sectionTitle}
            onChange={(e) => setLayout((p) => ({ ...p, sectionTitle: e.target.value }))}
            disabled={loading}
          />
        </label>
        <label>
          <span>Нижний блок: заголовок</span>
          <input
            value={layout.ctaTitle}
            onChange={(e) => setLayout((p) => ({ ...p, ctaTitle: e.target.value }))}
            disabled={loading}
          />
        </label>
        <label>
          <span>Нижний блок: текст</span>
          <textarea
            rows={2}
            value={layout.ctaText}
            onChange={(e) => setLayout((p) => ({ ...p, ctaText: e.target.value }))}
            disabled={loading}
          />
        </label>
      </div>

      <div className="catalog-layout-panel__actions">
        <button
          type="button"
          className="catalog-layout-panel__save"
          disabled={saving || loading}
          onClick={() => void save()}
        >
          {saving ? "Сохраняем…" : "Сохранить тексты"}
        </button>
        <button type="button" className="catalog-layout-panel__reload" onClick={() => void load()} disabled={loading}>
          Обновить
        </button>
      </div>
    </section>
  );
}

export function TariffsLayoutPanel() {
  return <CatalogLayoutPanel page="tariffs" />;
}

export function FleetLayoutPanel() {
  return <CatalogLayoutPanel page="fleet" />;
}
