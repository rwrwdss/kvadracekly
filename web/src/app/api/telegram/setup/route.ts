import { NextRequest, NextResponse } from "next/server";
import { telegramApi, telegramBotToken } from "@/lib/telegram/client";

export const dynamic = "force-dynamic";

/**
 * POST /api/telegram/setup
 * Заголовок Authorization: Bearer <TELEGRAM_WEBHOOK_SECRET или PAYLOAD_SECRET>
 * Ставит webhook на текущий SITE_URL.
 */
export async function POST(req: NextRequest) {
  const expected =
    process.env.TELEGRAM_WEBHOOK_SECRET?.trim() || process.env.PAYLOAD_SECRET?.trim();
  const auth = req.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (!expected || token !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    telegramBotToken();
  } catch {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN missing" }, { status: 503 });
  }

  const site =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://volnitsa-rent.com";
  const webhookUrl = `${site}/api/telegram/webhook`;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();

  const result = await telegramApi("setWebhook", {
    url: webhookUrl,
    secret_token: secret || undefined,
    allowed_updates: ["message"],
    drop_pending_updates: true,
  });

  const info = await telegramApi("getWebhookInfo");

  return NextResponse.json({ ok: true, webhookUrl, result, info });
}

export async function GET(req: NextRequest) {
  const expected =
    process.env.TELEGRAM_WEBHOOK_SECRET?.trim() || process.env.PAYLOAD_SECRET?.trim();
  const auth = req.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  if (!expected || token !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const info = await telegramApi("getWebhookInfo");
    const me = await telegramApi<{ username?: string }>("getMe");
    return NextResponse.json({ ok: true, me, info });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "fail" },
      { status: 500 },
    );
  }
}
