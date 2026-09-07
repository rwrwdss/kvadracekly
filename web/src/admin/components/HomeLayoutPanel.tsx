"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Link, useAuth } from "@payloadcms/ui";
import {
  DEFAULT_GALLERY_INTRO,
  DEFAULT_PAGE_HOME,
} from "@/lib/cms/homeDefaults";

type HomeForm = {
  eyebrow: string;
  titleLine1: string;
  titleLine2: string;
  tagline: string;
  imageUrl: string;
  imageAlt: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
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
    factsText: factsToText(facts?.length ? facts : DEFAULT_PAGE_HOME.facts),
  };
}

/** Панель текстов героя главной + intro галереи. */
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
      if (!res.ok) throw new Error(data.error || "Ошибка загрузки");
      setHome(homeFromApi(data.pageHome));
      const g = data.galleryIntro || {};
      setIntro({
        title: String(g.title || DEFAULT_GALLERY_INTRO.title),
        subtitle: String(g.subtitle || DEFAULT_GALLERY_INTRO.subtitle),
        description: String(g.description || DEFAULT_GALLERY_INTRO.description),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
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
            facts: textToFacts(home.factsText),
          },
          galleryIntro: intro,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Не удалось сохранить");
      setMessage("Сохранено. Обновите главную на сайте, чтобы увидеть изменения.");
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
          <p className="catalog-layout-panel__eyebrow">Главная страница</p>
          <h2 className="catalog-layout-panel__title">Герой и тексты галереи</h2>
          <p className="catalog-layout-panel__lead">
            Правьте «Прокат / квадроциклов», слоган и факты. Фото карусели — в{" "}
            <Link href="/admin/collections/gallery" prefetch={false}>
              Галерее
            </Link>
            : создайте запись и загрузите файл.
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
              <legend>Герой главной</legend>
              <label>
                <span>Надзаголовок</span>
                <input
                  value={home.eyebrow}
                  onChange={(e) => setHome((p) => ({ ...p, eyebrow: e.target.value }))}
                />
              </label>
              <label>
                <span>Заголовок · строка 1</span>
                <input
                  value={home.titleLine1}
                  onChange={(e) => setHome((p) => ({ ...p, titleLine1: e.target.value }))}
                  placeholder="Прокат"
                />
              </label>
              <label>
                <span>Заголовок · строка 2</span>
                <input
                  value={home.titleLine2}
                  onChange={(e) => setHome((p) => ({ ...p, titleLine2: e.target.value }))}
                  placeholder="квадроциклов"
                />
              </label>
              <label>
                <span>Слоган</span>
                <input
                  value={home.tagline}
                  onChange={(e) => setHome((p) => ({ ...p, tagline: e.target.value }))}
                />
              </label>
              <label>
                <span>Фон (путь к картинке)</span>
                <input
                  value={home.imageUrl}
                  onChange={(e) => setHome((p) => ({ ...p, imageUrl: e.target.value }))}
                  placeholder="/images/hero/...."
                />
              </label>
              <label>
                <span>Alt фона</span>
                <input
                  value={home.imageAlt}
                  onChange={(e) => setHome((p) => ({ ...p, imageAlt: e.target.value }))}
                />
              </label>
            </fieldset>

            <fieldset className="catalog-layout-panel__box">
              <legend>Кнопки и факты</legend>
              <label>
                <span>Кнопка 1</span>
                <input
                  value={home.primaryCtaLabel}
                  onChange={(e) => setHome((p) => ({ ...p, primaryCtaLabel: e.target.value }))}
                />
              </label>
              <label>
                <span>Кнопка 2</span>
                <input
                  value={home.secondaryCtaLabel}
                  onChange={(e) => setHome((p) => ({ ...p, secondaryCtaLabel: e.target.value }))}
                />
              </label>
              <label>
                <span>Факты под героем (по одному в строке)</span>
                <textarea
                  rows={5}
                  value={home.factsText}
                  onChange={(e) => setHome((p) => ({ ...p, factsText: e.target.value }))}
                />
              </label>
            </fieldset>

            <fieldset className="catalog-layout-panel__box">
              <legend>Страница /galereya · тексты</legend>
              <p className="catalog-layout-panel__hint">
                Сами фото карусели и сетки — коллекция «Галерея» (импорт файла в поле Фото).
              </p>
              <label>
                <span>H1</span>
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
                <span>Описание</span>
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
              {saving ? "Сохранение…" : "Сохранить тексты главной"}
            </button>
            <button type="button" className="catalog-layout-panel__reload" onClick={() => void load()}>
              Обновить
            </button>
            <Link href="/admin/collections/gallery" prefetch={false}>
              Фото галереи →
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

/** Панель над списком «Галерея». */
export function GalleryHomePanel() {
  return <HomeLayoutPanel />;
}
