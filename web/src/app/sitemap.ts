import type { MetadataRoute } from "next";
import { NAV } from "@/data/site";
import { siteOrigin } from "@/lib/seo";

/** Страницы, которые должны попадать в поиск. Служебные сюда не входят. */
const EXTRA_PATHS = ["/", "/politika-pdn"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = siteOrigin();
  const paths = [
    ...EXTRA_PATHS,
    ...NAV.map((item) => item.href),
  ];
  const unique = [...new Set(paths)];

  return unique.map((path) => ({
    url: path === "/" ? origin : `${origin}${path}`,
    changeFrequency: path === "/politika-pdn" ? "yearly" : "weekly",
    priority: path === "/" ? 1 : path === "/politika-pdn" ? 0.3 : 0.8,
  }));
}
