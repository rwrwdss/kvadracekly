import { NextRequest, NextResponse } from "next/server";
import { headers as getHeaders } from "next/headers";
import { getPayload } from "payload";
import config from "@payload-config";
import { isAdmin } from "@/access/roles";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const ALLOWED = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "video/mp4",
  "video/webm",
]);

/** POST multipart: file + optional alt → создаёт документ media. Только admin. */
export async function POST(req: NextRequest) {
  const payload = await getPayload({ config });
  const headers = await getHeaders();
  const { user } = await payload.auth({ headers });
  if (!isAdmin(user)) {
    return NextResponse.json({ error: "Нужна авторизация админа" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Ожидается multipart/form-data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "Файл не передан" }, { status: 400 });
  }

  const blob = file as File;
  const mime = String(blob.type || "").toLowerCase();
  const isImage = mime.startsWith("image/");
  const isVideo = mime === "video/mp4" || mime === "video/webm";
  if (!isImage && !isVideo && !ALLOWED.has(mime)) {
    return NextResponse.json(
      { error: "Допустимы изображения и видео MP4/WebM" },
      { status: 400 },
    );
  }

  const altRaw = String(form.get("alt") || "").trim();
  const alt =
    altRaw ||
    (isVideo ? "Видео фона" : "Фото") ||
    blob.name.replace(/\.[^.]+$/, "") ||
    "Медиафайл";

  const buffer = Buffer.from(await blob.arrayBuffer());
  if (!buffer.length) {
    return NextResponse.json({ error: "Пустой файл" }, { status: 400 });
  }

  try {
    const doc = await payload.create({
      collection: "media",
      data: { alt },
      file: {
        data: buffer,
        mimetype: mime || (isVideo ? "video/mp4" : "image/jpeg"),
        name: blob.name || (isVideo ? "video.mp4" : "image.jpg"),
        size: buffer.length,
      },
      overrideAccess: true,
      req: { user } as never,
    });

    const url =
      (typeof doc.url === "string" && doc.url) ||
      (doc.sizes && typeof doc.sizes === "object"
        ? (doc.sizes as { hero?: { url?: string }; card?: { url?: string } }).hero?.url ||
          (doc.sizes as { card?: { url?: string } }).card?.url
        : null) ||
      null;

    return NextResponse.json({
      id: doc.id,
      url,
      mimeType: doc.mimeType || mime,
      filename: doc.filename || blob.name,
      alt: doc.alt || alt,
    });
  } catch (err) {
    console.error("[media-upload]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Не удалось загрузить файл" },
      { status: 500 },
    );
  }
}
