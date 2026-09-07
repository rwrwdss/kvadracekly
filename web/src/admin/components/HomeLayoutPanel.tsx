"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Link, useAuth } from "@payloadcms/ui";
import {
  DEFAULT_GALLERY_INTRO,
  DEFAULT_PAGE_HOME,
} from "@/lib/cms/homeDefaults";
import { AdminImagePathInput } from "./AdminImageThumb";

type HomeForm = {
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;
  tagline: string;
  imageUrl: string;
  imageAlt: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  experienceHint: string;
  factsText: string;
};

type IntroForm = {
  title: string;
  subtitle: string;
  description: string;
};

function factsToText(facts: { label?: string | null }[] | string[] | null | undefined): string {
  if (!facts?.length) return "";
  return facts
    .map((f) => (typeof f === "string" ? f : String(f?.label || "").trim()))
    .filter(Boolean)
    .join("\n");
}

function textToFacts(text: string): { label: string }[] {
  return text
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((label) => ({ label }));
}

function homeFromApi(group: Record<string, unknown> | null | undefined): HomeForm {
  const facts = group?.facts as { label?: string | null }[] | undefined;
  return {
    eyebrow: String(group?.eyebrow || DEFAULT_PAGE_HOME.eyebrow),
    titleLine1: String(group?.titleLine1 || DEFAULT_PAGE_HOME.titleLine1),
    titleLine2: String(group?.titleLine2 || DEFAULT_PAGE_HOME.titleLine2),
    tagline: String(group?.tagline || DEFAULT_PAGE_HOME.tagline),
    imageUrl: String(group?.imageUrl || DEFAULT_PAGE_HOME.imageUrl),
    imageAlt: String(group?.imageAlt || DEFAULT_PAGE_HOME.imageAlt),
    primaryCtaLabel: String(group?.primaryCtaLabel || DEFAULT_PAGE_HOME.primaryCtaLabel),
    secondaryCtaLabel: String(group?.secondaryCtaLabel || DEFAULT_PAGE_HOME.secondaryCtaLabel),
    experienceHint: String(group?.experienceHint || DEFAULT_PAGE_HOME.experienceHint),
    factsText: factsToText(facts?.length ? facts : DEFAULT_PAGE_HOME.facts),
  };
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="catalog-layout-panel__hint">{children}</p>;
}

/** Панель текстов первого экрана главной + тексты страницы галереи. */
export function HomeLayoutPanel() {
  const { user } = useAuth();
  const role =
    user && typeof user === "object" && "role" in user
      ? String((user as { role?: string }).role || "")
      : "";
  const isAdmin = role === "admin";

  const [home, setHome] = useState<HomeForm>(() => homeFromApi(null));
  const [intro, setIntro] = useState<IntroForm>({ ...DEFAULT_GALLERY_INTRO });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/home-layout", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Не удалось загрузить тексты");
      setHome(homeFromApi(data.pageHome));
      const g = data.galleryIntro || {};
      setIntro({
        title: String(g.title || DEFAULT_GALLERY_INTRO.title),
        subtitle: String(g.subtitle || DEFAULT_GALLERY_INTRO.subtitle),
        description: String(g.description || DEFAULT_GALLERY_INTRO.description),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    if (!isAdmin) return;
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/admin/home-layout", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          pageHome: {
            eyebrow: home.eyebrow,
            titleLine1: home.titleLine1,
            titleLine2: home.titleLine2,
            tagline: home.tagline,
            imageUrl: home.imageUrl,
            imageAlt: home.imageAlt,
            primaryCtaLabel: home.primaryCtaLabel,
            secondaryCtaLabel: home.secondaryCtaLabel,
            experienceHint: home.experienceHint,
            facts: textToFacts(home.factsText),
          },
          galleryIntro: intro,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Не удалось сохранить");
      setMessage("Сохранено. Откройте главную страницу сайта и обновите её (F5).");
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
          <p className="catalog-layout-panel__eyebrow">Что видит гость на сайте</p>
          <h2 className="catalog-layout-panel__title">Тексты первого экрана главной</h2>
          <p className="catalog-layout-panel__lead">
            В полях уже стоят текущие тексты с сайта — меняйте их и нажмите «Сохранить». Фото
            карусели меняются отдельно:{" "}
            <Link href="/admin/collections/gallery" prefetch={false}>
              Фото для карусели
            </Link>
            .
          </p>
        </div>
        <button
          type="button"
          className="catalog-layout-panel__toggle"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Скрыть форму" : "Показать форму"}
        </button>
      </div>

      {open ? (
        <>
          {loading ? <p className="catalog-layout-panel__mute">Загружаем текущие тексты…</p> : null}
          {error ? <p className="catalog-layout-panel__error">{error}</p> : null}
          {message ? <p className="catalog-layout-panel__ok">{message}</p> : null}

          <div className="catalog-layout-panel__grid">
            <fieldset className="catalog-layout-panel__box">
              <legend>Большой заголовок на первом экране</legend>
              <FieldHint>
                Это то, что гость видит сразу при открытии сайта (тёмный экран с фото).
              </FieldHint>
              <label>
                <span>Мелкий текст над заголовком</span>
                <input
                  value={home.eyebrow}
                  onChange={(e) => setHome((p) => ({ ...p, eyebrow: e.target.value }))}
                />
              </label>
              <label>
                <span>Большой заголовок — первая строка</span>
                <input
                  value={home.titleLine1}
                  onChange={(e) => setHome((p) => ({ ...p, titleLine1: e.target.value }))}
                />
              </label>
              <label>
                <span>Большой заголовок — вторая строка</span>
                <input
                  value={home.titleLine2}
                  onChange={(e) => setHome((p) => ({ ...p, titleLine2: e.target.value }))}
                />
              </label>
              <label>
                <span>Фраза под заголовком (золотым цветом)</span>
                <input
                  value={home.tagline}
                  onChange={(e) => setHome((p) => ({ ...p, tagline: e.target.value }))}
                />
              </label>
            </fieldset>

            <fieldset className="catalog-layout-panel__box">
              <legend>Кнопки и строчки под заголовком</legend>
              <label>
                <span>Текст первой кнопки (ведёт к маршрутам)</span>
                <input
                  value={home.primaryCtaLabel}
                  onChange={(e) => setHome((p) => ({ ...p, primaryCtaLabel: e.target.value }))}
                />
              </label>
              <label>
                <span>Текст второй кнопки (открывает запись)</span>
                <input
                  value={home.secondaryCtaLabel}
                  onChange={(e) => setHome((p) => ({ ...p, secondaryCtaLabel: e.target.value }))}
                />
              </label>
              <label>
                <span>Подсказка под кнопками (про опыт)</span>
                <textarea
                  rows={3}
                  value={home.experienceHint}
                  onChange={(e) => setHome((p) => ({ ...p, experienceHint: e.target.value }))}
                />
              </label>
              <label>
                <span>Короткие факты под кнопками</span>
                <textarea
                  rows={5}
                  value={home.factsText}
                  onChange={(e) => setHome((p) => ({ ...p, factsText: e.target.value }))}
                />
              </label>
              <FieldHint>Каждый факт — с новой строки. Обычно 4 штуки.</FieldHint>
              <AdminImagePathInput
                label="Картинка фона первого экрана"
                value={home.imageUrl}
                onChange={(imageUrl) => setHome((p) => ({ ...p, imageUrl }))}
                hint="Справа — превью. Путь вида /images/hero/….jpg"
              />
              <label>
                <span>Описание картинки для слабовидящих</span>
                <input
                  value={home.imageAlt}
                  onChange={(e) => setHome((p) => ({ ...p, imageAlt: e.target.value }))}
                />
              </label>
            </fieldset>

            <fieldset className="catalog-layout-panel__box">
              <legend>Тексты страницы «Галерея»</legend>
              <FieldHint>
                Это заголовки на странице /galereya. Сами фото добавляйте в разделе «Фото для
                карусели».
              </FieldHint>
              <label>
                <span>Главный заголовок страницы</span>
                <input
                  value={intro.title}
                  onChange={(e) => setIntro((p) => ({ ...p, title: e.target.value }))}
                />
              </label>
              <label>
                <span>Подзаголовок</span>
                <input
                  value={intro.subtitle}
                  onChange={(e) => setIntro((p) => ({ ...p, subtitle: e.target.value }))}
                />
              </label>
              <label>
                <span>Текст-описание под заголовками</span>
                <textarea
                  rows={3}
                  value={intro.description}
                  onChange={(e) => setIntro((p) => ({ ...p, description: e.target.value }))}
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
              {saving ? "Сохраняем…" : "Сохранить изменения"}
            </button>
            <button type="button" className="catalog-layout-panel__reload" onClick={() => void load()}>
              Вернуть с сервера
            </button>
            <Link href="/admin/collections/gallery" prefetch={false}>
              Перейти к фото →
            </Link>
            <Link href="/" prefetch={false}>
              Открыть сайт →
            </Link>
          </div>
        </>
      ) : null}
    </section>
  );
}

/** Панель над списком фото галереи. */
export function GalleryHomePanel() {
  return <HomeLayoutPanel />;
}
