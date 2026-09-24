/**
 * Публичные URL картинок: на проде — Vercel Blob, локально — /public/images.
 * Пути вида /images/... мапятся на `${NEXT_PUBLIC_BLOB_BASE_URL}/images/...`.
 */
const FALLBACK_BLOB_BASE = "https://3bwdnic2wi5tyelh.public.blob.vercel-storage.com";

function blobBase(): string {
  return (
    process.env.NEXT_PUBLIC_BLOB_BASE_URL ||
    (process.env.VERCEL === "1" || process.env.NODE_ENV === "production"
      ? FALLBACK_BLOB_BASE
      : "")
  ).replace(/\/$/, "");
}

export function resolveAssetUrl(src: string | null | undefined): string {
  const value = String(src || "").trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value) || value.startsWith("data:") || value.startsWith("blob:")) {
    return value;
  }

  const base = blobBase();
  if (!base) return value;

  // Payload media file route → прямой публичный Blob URL
  if (value.startsWith("/api/media/file/")) {
    const filename = decodeURIComponent(
      value.slice("/api/media/file/".length).split("?")[0] || "",
    );
    if (filename) return `${base}/${filename}`;
  }

  if (value.startsWith("/images/")) {
    return `${base}${value}`;
  }
  if (value.startsWith("images/")) {
    return `${base}/${value}`;
  }
  return value;
}

/** Короткий алиас для статических констант в data/site. */
export function asset(src: string): string {
  return resolveAssetUrl(src);
}
