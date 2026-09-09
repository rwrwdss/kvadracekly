import type { GlobalConfig } from "payload";
import { revalidatePath } from "next/cache";
import { hideFromManager, isAdmin } from "@/access/roles";
import { BOOKING_SLOTS, SLOT_CAPACITY } from "@/lib/booking/slots";
import {
  catalogPageLayoutFields,
  DEFAULT_PAGE_FLEET,
  DEFAULT_PAGE_TARIFFS,
} from "@/lib/cms/catalogPageDefaults";
import { DEFAULT_GALLERY_INTRO, DEFAULT_PAGE_HOME } from "@/lib/cms/homeDefaults";

function revalidateSitePages() {
  try {
    revalidatePath("/");
    revalidatePath("/tarify");
    revalidatePath("/tehnika");
    revalidatePath("/galereya");
  } catch {
    /* outside Next request */
  }
}

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "Настройки сайта",
  admin: {
    hidden: ({ user }) => hideFromManager(user),
  },
  access: {
    read: () => true,
    update: ({ req }) => isAdmin(req.user),
  },
  hooks: {
    afterChange: [() => revalidateSitePages()],
    afterRead: [
      ({ doc }) => {
        if (!doc || typeof doc !== "object") return doc;

        const fillPage = (
          raw: Record<string, unknown> | undefined,
          defaults: typeof DEFAULT_PAGE_TARIFFS,
        ) => {
          const page = raw || {};
          const chips = page.chips as { label?: string }[] | undefined;
          return {
            ...page,
            title: String(page.title || "").trim() || defaults.title,
            subtitle: String(page.subtitle || "").trim() || defaults.subtitle,
            description: String(page.description || "").trim() || defaults.description,
            imageUrl: String(page.imageUrl || "").trim() || defaults.imageUrl,
            imageAlt: String(page.imageAlt || "").trim() || defaults.imageAlt,
            sectionLabel: String(page.sectionLabel || "").trim() || defaults.sectionLabel,
            sectionTitle: String(page.sectionTitle || "").trim() || defaults.sectionTitle,
            ctaTitle: String(page.ctaTitle || "").trim() || defaults.ctaTitle,
            ctaText: String(page.ctaText || "").trim() || defaults.ctaText,
            chips:
              chips?.length && chips.some((c) => String(c?.label || "").trim())
                ? chips
                : defaults.chips.map((label) => ({ label })),
          };
        };

        const home = (doc as { pageHome?: Record<string, unknown> }).pageHome || {};
        const intro = (doc as { galleryIntro?: Record<string, unknown> }).galleryIntro || {};
        const facts = home.facts as { label?: string }[] | undefined;

        (doc as { pageHome: Record<string, unknown> }).pageHome = {
          ...home,
          eyebrow: String(home.eyebrow || "").trim() || DEFAULT_PAGE_HOME.eyebrow,
          titleLine1: String(home.titleLine1 || "").trim() || DEFAULT_PAGE_HOME.titleLine1,
          titleLine2: String(home.titleLine2 || "").trim() || DEFAULT_PAGE_HOME.titleLine2,
          tagline: String(home.tagline || "").trim() || DEFAULT_PAGE_HOME.tagline,
          imageUrl: String(home.imageUrl || "").trim() || DEFAULT_PAGE_HOME.imageUrl,
          imageAlt: String(home.imageAlt || "").trim() || DEFAULT_PAGE_HOME.imageAlt,
          primaryCtaLabel:
            String(home.primaryCtaLabel || "").trim() || DEFAULT_PAGE_HOME.primaryCtaLabel,
          secondaryCtaLabel:
            String(home.secondaryCtaLabel || "").trim() || DEFAULT_PAGE_HOME.secondaryCtaLabel,
          facts:
            facts?.length && facts.some((f) => String(f?.label || "").trim())
              ? facts
              : DEFAULT_PAGE_HOME.facts.map((label) => ({ label })),
          experienceHint:
            String(home.experienceHint || "").trim() || DEFAULT_PAGE_HOME.experienceHint,
        };

        (doc as { galleryIntro: Record<string, unknown> }).galleryIntro = {
          ...intro,
          title: String(intro.title || "").trim() || DEFAULT_GALLERY_INTRO.title,
          subtitle: String(intro.subtitle || "").trim() || DEFAULT_GALLERY_INTRO.subtitle,
          description: String(intro.description || "").trim() || DEFAULT_GALLERY_INTRO.description,
        };

        (doc as { pageTariffs: Record<string, unknown> }).pageTariffs = fillPage(
          (doc as { pageTariffs?: Record<string, unknown> }).pageTariffs,
          DEFAULT_PAGE_TARIFFS,
        );
        (doc as { pageFleet: Record<string, unknown> }).pageFleet = fillPage(
          (doc as { pageFleet?: Record<string, unknown> }).pageFleet,
          DEFAULT_PAGE_FLEET,
        );

        return doc;
      },
    ],
  },
  fields: [
    {
      name: "siteName",
      type: "text",
      label: "Название сайта",
      defaultValue: "Вольница",
      admin: { hidden: true },
    },
    {
      name: "tagline",
      type: "text",
      label: "Слоган",
      defaultValue: "Территория свободы",
      admin: { hidden: true },
    },
    {
      name: "booking",
      type: "group",
      label: "Календарь записи (очередь)",
      admin: {
        description:
          "Включение календаря и вместимость слота. Остановки дней — в разделе Календарь → Остановка.",
      },
      fields: [
        {
          name: "enabled",
          type: "checkbox",
          label: "Календарь включён",
          defaultValue: true,
        },
        {
          name: "slotCapacity",
          type: "number",
          label: "Записей на один слот времени",
          defaultValue: SLOT_CAPACITY,
          min: 1,
          max: 10,
          admin: {
            description:
              "Сколько отдельных заявок можно принять на одно время (например 14:00). По умолчанию 3.",
          },
        },
        {
          name: "slotHint",
          type: "text",
          label: "Слоты на сайте",
          defaultValue: `${BOOKING_SLOTS.join(", ")} · занятость по длительности тарифа (до 22:00)`,
          admin: {
            readOnly: true,
            description:
              "Старты 10:00–20:00. Занятость — интервал [старт, старт+durationMinutes), capacity пересечений.",
          },
        },
        {
          name: "closedRanges",
          type: "array",
          label: "Остановки календаря (периоды)",
          labels: { singular: "Период", plural: "Периоды" },
          admin: {
            hidden: true,
            description: "Правится в Календарь → Остановка.",
          },
          fields: [
            {
              name: "from",
              type: "text",
              label: "С (ГГГГ-ММ-ДД)",
              required: true,
              admin: { placeholder: "2026-09-15" },
            },
            {
              name: "to",
              type: "text",
              label: "По (ГГГГ-ММ-ДД)",
              required: true,
              admin: { placeholder: "2026-09-20" },
            },
            {
              name: "note",
              type: "text",
              label: "Причина",
            },
          ],
        },
        {
          name: "closedDates",
          type: "array",
          label: "Закрытые дни (по одному)",
          labels: { singular: "День", plural: "Закрытые дни" },
          admin: {
            hidden: true,
            description: "Правится в Календарь → Остановка.",
          },
          fields: [
            {
              name: "date",
              type: "text",
              label: "Дата (ГГГГ-ММ-ДД)",
              required: true,
              admin: { placeholder: "2026-09-15" },
            },
            {
              name: "note",
              type: "text",
              label: "Причина (для себя)",
            },
          ],
        },
      ],
    },
    {
      name: "season",
      type: "group",
      label: "Сезон проката",
      admin: {
        description: "Влияет на показ тарифов и техники (квадро / снег / пауза). Баннер на сайте отключён.",
      },
      fields: [
        {
          name: "current",
          type: "select",
          label: "Текущий сезон",
          defaultValue: "atv",
          options: [
            { label: "Квадроциклы", value: "atv" },
            { label: "Снегоходы", value: "snow" },
            { label: "Пауза / пересменка", value: "pause" },
          ],
        },
        {
          name: "label",
          type: "text",
          label: "Подпись баннера (не используется)",
          defaultValue: "Сезон квадроциклов",
          admin: { hidden: true },
        },
        {
          name: "bannerText",
          type: "textarea",
          label: "Текст баннера (не используется)",
          defaultValue:
            "Сейчас сезон квадроциклов. Можно оставить заявку на ближайшие даты.",
          admin: { hidden: true },
        },
      ],
    },
    {
      name: "pageHome",
      type: "group",
      label: "Главная — первый экран",
      admin: {
        hidden: true,
        description: "Скрыто в админке. Тексты первого экрана задаются в коде/дефолтах.",
      },
      fields: [
        {
          name: "eyebrow",
          type: "text",
          label: "Мелкий текст над заголовком",
          defaultValue: DEFAULT_PAGE_HOME.eyebrow,
          admin: {
            description: `Сейчас на сайте: «${DEFAULT_PAGE_HOME.eyebrow}»`,
          },
        },
        {
          name: "titleLine1",
          type: "text",
          label: "Большой заголовок — первая строка",
          defaultValue: DEFAULT_PAGE_HOME.titleLine1,
          admin: {
            description: `Сейчас на сайте: «${DEFAULT_PAGE_HOME.titleLine1}» (например: Прокат)`,
          },
        },
        {
          name: "titleLine2",
          type: "text",
          label: "Большой заголовок — вторая строка",
          defaultValue: DEFAULT_PAGE_HOME.titleLine2,
          admin: {
            description: `Сейчас на сайте: «${DEFAULT_PAGE_HOME.titleLine2}»`,
          },
        },
        {
          name: "tagline",
          type: "text",
          label: "Фраза под заголовком (золотым)",
          defaultValue: DEFAULT_PAGE_HOME.tagline,
          admin: {
            description: `Сейчас на сайте: «${DEFAULT_PAGE_HOME.tagline}»`,
          },
        },
        {
          name: "imageUrl",
          type: "text",
          label: "Картинка фона первого экрана (путь к файлу)",
          defaultValue: DEFAULT_PAGE_HOME.imageUrl,
          admin: {
            description: "Справа — превью текущей картинки. Можно заменить путём или файлом ниже.",
            components: {
              Field: "./admin/components/ImagePathField#ImagePathField",
            },
          },
        },
        {
          name: "cover",
          type: "upload",
          relationTo: "media",
          label: "Или загрузить свою картинку фона",
          admin: {
            description: "Если загрузите файл — он заменит путь выше.",
          },
        },
        {
          name: "imageAlt",
          type: "text",
          label: "Описание картинки (для слабовидящих)",
          defaultValue: DEFAULT_PAGE_HOME.imageAlt,
        },
        {
          name: "primaryCtaLabel",
          type: "text",
          label: "Текст первой кнопки",
          defaultValue: DEFAULT_PAGE_HOME.primaryCtaLabel,
          admin: {
            description: `Сейчас: «${DEFAULT_PAGE_HOME.primaryCtaLabel}»`,
          },
        },
        {
          name: "secondaryCtaLabel",
          type: "text",
          label: "Текст второй кнопки",
          defaultValue: DEFAULT_PAGE_HOME.secondaryCtaLabel,
          admin: {
            description: `Сейчас: «${DEFAULT_PAGE_HOME.secondaryCtaLabel}»`,
          },
        },
        {
          name: "experienceHint",
          type: "textarea",
          label: "Подсказка под кнопками (про опыт)",
          defaultValue: DEFAULT_PAGE_HOME.experienceHint,
          admin: {
            description: "Для гостей, которые уже катались — видно сразу под кнопками.",
          },
        },
        {
          name: "facts",
          type: "array",
          label: "Короткие факты под кнопками",
          labels: { singular: "Факт", plural: "Факты" },
          defaultValue: DEFAULT_PAGE_HOME.facts.map((label) => ({ label })),
          admin: {
            description: `Сейчас: ${DEFAULT_PAGE_HOME.facts.join(" · ")}`,
          },
          fields: [
            {
              name: "label",
              type: "text",
              label: "Текст факта",
              required: true,
            },
          ],
        },
      ],
    },
    {
      name: "pageTariffs",
      type: "group",
      label: "Страница «Тарифы» — тексты первого экрана",
      admin: {
        hidden: true,
        description: "Править панелью над списком Тарифы.",
      },
      fields: catalogPageLayoutFields(DEFAULT_PAGE_TARIFFS),
    },
    {
      name: "pageFleet",
      type: "group",
      label: "Страница «Техника» — тексты первого экрана",
      admin: {
        hidden: true,
        description: "Править панелью над списком Техника.",
      },
      fields: catalogPageLayoutFields(DEFAULT_PAGE_FLEET),
    },
    {
      name: "defaultSeo",
      type: "group",
      label: "SEO по умолчанию",
      admin: { hidden: true },
      fields: [
        { name: "metaTitle", type: "text", label: "Meta Title" },
        { name: "metaDescription", type: "textarea", label: "Meta Description" },
        { name: "metaKeywords", type: "text", label: "Keywords" },
        {
          name: "ogImage",
          type: "upload",
          relationTo: "media",
          label: "OG Image",
        },
      ],
    },
    {
      name: "galleryIntro",
      type: "group",
      label: "Галерея — тексты страницы",
      admin: {
        hidden: true,
        description: "Скрыто в админке. Тексты первого экрана задаются в коде/дефолтах.",
      },
      fields: [
        {
          name: "title",
          type: "text",
          label: "Главный заголовок страницы",
          defaultValue: DEFAULT_GALLERY_INTRO.title,
          admin: { description: `Сейчас: «${DEFAULT_GALLERY_INTRO.title}»` },
        },
        {
          name: "subtitle",
          type: "text",
          label: "Подзаголовок",
          defaultValue: DEFAULT_GALLERY_INTRO.subtitle,
          admin: { description: `Сейчас: «${DEFAULT_GALLERY_INTRO.subtitle}»` },
        },
        {
          name: "description",
          type: "textarea",
          label: "Текст-описание",
          defaultValue: DEFAULT_GALLERY_INTRO.description,
          admin: { description: `Сейчас: «${DEFAULT_GALLERY_INTRO.description}»` },
        },
      ],
    },
    {
      name: "notify",
      type: "group",
      label: "Уведомления о заявках",
      admin: {
        hidden: true,
        description: "Скрыто, пока Telegram/почта не подключены.",
      },
      fields: [
        {
          name: "channelHint",
          type: "text",
          label: "Канал уведомлений",
          admin: {
            readOnly: true,
            description: "Настраивается администратором на сервере.",
          },
          defaultValue: "Telegram / Email — через настройки сервера",
        },
      ],
    },
  ],
};
