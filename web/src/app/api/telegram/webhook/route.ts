import { NextRequest, NextResponse } from "next/server";
import {
  addTelegramChatId,
  getTelegramNotifySettings,
  setTelegramNotifyEnabled,
} from "@/lib/telegram/settings";
import { sendTelegramMessage, telegramBotToken } from "@/lib/telegram/client";

export const dynamic = "force-dynamic";
export const maxDuration = 20;

type TgMessage = {
  text?: string;
  chat?: { id?: number; type?: string; title?: string; username?: string };
  from?: { id?: number; username?: string; first_name?: string };
};

type TgUpdate = {
  update_id?: number;
  message?: TgMessage;
  edited_message?: TgMessage;
};

function unauthorized() {
  return NextResponse.json({ ok: false }, { status: 401 });
}

function helpText(enabled: boolean, chats: number): string {
  return [
    "Бот заявок Вольница",
    "",
    `Рассылка: ${enabled ? "ВКЛ ✅" : "ВЫКЛ ⏸"}`,
    `Чатов в списке: ${chats}`,
    "",
    "Команды:",
    "/notify_on — включить рассылку заявок",
    "/notify_off — отключить рассылку заявок",
    "/status — статус",
    "/start — подписать этот чат на заявки",
  ].join("\n");
}

export async function POST(req: NextRequest) {
  try {
    telegramBotToken();
  } catch {
    return NextResponse.json({ ok: false, error: "bot token missing" }, { status: 503 });
  }

  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  if (secret) {
    const header = req.headers.get("x-telegram-bot-api-secret-token");
    if (header !== secret) return unauthorized();
  }

  let update: TgUpdate;
  try {
    update = (await req.json()) as TgUpdate;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const message = update.message || update.edited_message;
  const chatId = message?.chat?.id;
  const text = String(message?.text || "").trim();
  if (!chatId || !text) {
    return NextResponse.json({ ok: true });
  }

  const cmd = text.split(/\s+/)[0]?.toLowerCase().split("@")[0] || "";

  try {
    if (cmd === "/start") {
      const settings = await addTelegramChatId(chatId);
      await sendTelegramMessage(chatId, helpText(settings.enabled, settings.chatIds.length));
      return NextResponse.json({ ok: true });
    }

    if (cmd === "/notify_on" || cmd === "/on" || cmd === "/вкл") {
      await addTelegramChatId(chatId);
      const settings = await setTelegramNotifyEnabled(true);
      await sendTelegramMessage(
        chatId,
        `Рассылка заявок ВКЛЮЧЕНА ✅\nЧатов: ${settings.chatIds.length}`,
      );
      return NextResponse.json({ ok: true });
    }

    if (cmd === "/notify_off" || cmd === "/off" || cmd === "/выкл") {
      const settings = await setTelegramNotifyEnabled(false);
      await sendTelegramMessage(
        chatId,
        `Рассылка заявок ВЫКЛЮЧЕНА ⏸\nЗаявки в CRM пишутся, в Telegram не уходят.\nЧатов в списке: ${settings.chatIds.length}`,
      );
      return NextResponse.json({ ok: true });
    }

    if (cmd === "/status" || cmd === "/help") {
      const settings = await getTelegramNotifySettings();
      await sendTelegramMessage(chatId, helpText(settings.enabled, settings.chatIds.length));
      return NextResponse.json({ ok: true });
    }

    // неизвестная команда — коротко
    if (cmd.startsWith("/")) {
      await sendTelegramMessage(chatId, helpText(true, 0));
    }
  } catch (err) {
    console.error("[telegram:webhook]", err);
  }

  return NextResponse.json({ ok: true });
}
