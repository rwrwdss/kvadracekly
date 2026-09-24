const TELEGRAM_API = "https://api.telegram.org";

export function telegramBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN не задан");
  return token;
}

export async function telegramApi<T = unknown>(
  method: string,
  body?: Record<string, unknown>,
  timeoutMs = 8_000,
): Promise<T> {
  const token = telegramBotToken();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${TELEGRAM_API}/bot${token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      description?: string;
      result?: T;
    };
    if (!res.ok || data.ok === false) {
      throw new Error(data.description || `Telegram ${method} HTTP ${res.status}`);
    }
    return data.result as T;
  } finally {
    clearTimeout(timer);
  }
}

export async function sendTelegramMessage(chatId: string | number, text: string): Promise<void> {
  await telegramApi("sendMessage", {
    chat_id: chatId,
    text,
    disable_web_page_preview: true,
  });
}
