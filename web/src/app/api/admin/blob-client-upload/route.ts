import { NextRequest, NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { headers as getHeaders } from "next/headers";
import { getPayload } from "payload";
import config from "@payload-config";
import { isAdmin } from "@/access/roles";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const ALLOWED = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "video/mp4",
  "video/webm",
  // Windows часто шлёт пустой type / octet-stream; Blob всё равно проверит по whitelist
  "application/octet-stream",
];

/** Client-upload token endpoint — файл идёт напрямую в Blob, минуя лимит 4.5MB у Vercel. */
export async function POST(req: NextRequest) {
  const payload = await getPayload({ config });
  const headers = await getHeaders();
  const { user } = await payload.auth({ headers });
  if (!isAdmin(user)) {
    return NextResponse.json({ error: "Нужна авторизация админа" }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "BLOB_READ_WRITE_TOKEN не задан" }, { status: 503 });
  }

  let body: HandleUploadBody;
  try {
    body = (await req.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
  }

  try {
    const json = await handleUpload({
      body,
      request: req,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ALLOWED,
        addRandomSuffix: true,
        maximumSizeInBytes: 200 * 1024 * 1024,
        tokenPayload: JSON.stringify({ userId: user?.id ?? null }),
      }),
    });
    return NextResponse.json(json);
  } catch (err) {
    console.error("[blob-client-upload]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Не удалось подготовить загрузку" },
      { status: 500 },
    );
  }
}
