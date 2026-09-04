import type { Metadata } from "next";
import { mediaUrl, type MediaDoc } from "@/lib/payload";

type SeoInput = {
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  canonical?: string | null;
  noIndex?: boolean | null;
  ogImage?: MediaDoc | number | string | null;
};

export function buildMetadata(opts: {
  title: string;
  description?: string;
  seo?: SeoInput | null;
  path?: string;
}): Metadata {
  const title = opts.seo?.metaTitle || opts.title;
  const description = opts.seo?.metaDescription || opts.description;
  const og = mediaUrl(opts.seo?.ogImage as MediaDoc | null);
  const base = process.env.NEXT_PUBLIC_SITE_URL || "";

  return {
    title,
    description: description || undefined,
    keywords: opts.seo?.metaKeywords || undefined,
    alternates: {
      canonical: opts.seo?.canonical || (opts.path && base ? `${base}${opts.path}` : undefined),
    },
    robots: opts.seo?.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description: description || undefined,
      images: og ? [{ url: og }] : undefined,
    },
  };
}
