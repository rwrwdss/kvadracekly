import type { Field } from "payload";

/** SEO-мета для страниц и товаров */
export const seoFields: Field = {
  name: "seo",
  type: "group",
  label: "SEO",
  admin: {
    description: "Мета-теги для поисковиков и соцсетей",
  },
  fields: [
    {
      name: "metaTitle",
      type: "text",
      label: "Meta Title",
      admin: { description: "До ~60 символов. Если пусто — берётся заголовок." },
    },
    {
      name: "metaDescription",
      type: "textarea",
      label: "Meta Description",
      admin: { description: "До ~160 символов." },
    },
    {
      name: "metaKeywords",
      type: "text",
      label: "Keywords",
      admin: { description: "Через запятую" },
    },
    {
      name: "ogImage",
      type: "upload",
      relationTo: "media",
      label: "OG Image",
      admin: { description: "Картинка для соцсетей (1200×630)" },
    },
    {
      name: "canonical",
      type: "text",
      label: "Canonical URL",
    },
    {
      name: "noIndex",
      type: "checkbox",
      label: "noindex",
      defaultValue: false,
    },
  ],
};

/** UTM-метки для маркетинговых ссылок / CTA товара */
export const utmFields: Field = {
  name: "utm",
  type: "group",
  label: "UTM-метки",
  admin: {
    description: "Подставляются в ссылки бронирования и рекламные URL",
  },
  fields: [
    { name: "source", type: "text", label: "utm_source" },
    { name: "medium", type: "text", label: "utm_medium" },
    { name: "campaign", type: "text", label: "utm_campaign" },
    { name: "content", type: "text", label: "utm_content" },
    { name: "term", type: "text", label: "utm_term" },
  ],
};

export function buildUtmQuery(utm?: {
  source?: string | null;
  medium?: string | null;
  campaign?: string | null;
  content?: string | null;
  term?: string | null;
} | null): string {
  if (!utm) return "";
  const params = new URLSearchParams();
  if (utm.source) params.set("utm_source", utm.source);
  if (utm.medium) params.set("utm_medium", utm.medium);
  if (utm.campaign) params.set("utm_campaign", utm.campaign);
  if (utm.content) params.set("utm_content", utm.content);
  if (utm.term) params.set("utm_term", utm.term);
  const q = params.toString();
  return q ? `?${q}` : "";
}
