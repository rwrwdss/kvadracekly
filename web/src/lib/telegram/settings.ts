import pg from "pg";

export type TelegramNotifySettings = {
  enabled: boolean;
  chatIds: string[];
};

const CREATE_SQL = `
CREATE TABLE IF NOT EXISTS telegram_notify_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  enabled boolean NOT NULL DEFAULT true,
  chat_ids text[] NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO telegram_notify_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;
`;

function databaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) throw new Error("DATABASE_URL is required");
  return url;
}

function envChatIds(): string[] {
  return String(process.env.TELEGRAM_CHAT_ID || "")
    .split(/[,;\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

async function withClient<T>(fn: (client: pg.Client) => Promise<T>): Promise<T> {
  const client = new pg.Client({
    connectionString: databaseUrl(),
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8_000,
  });
  await client.connect();
  try {
    await client.query(CREATE_SQL);
    return await fn(client);
  } finally {
    await client.end().catch(() => undefined);
  }
}

async function readSettings(client: pg.Client): Promise<TelegramNotifySettings> {
  const { rows } = await client.query<{ enabled: boolean; chat_ids: string[] | null }>(
    "SELECT enabled, chat_ids FROM telegram_notify_settings WHERE id = 1",
  );
  const row = rows[0];
  const fromDb = Array.isArray(row?.chat_ids) ? row.chat_ids.map(String) : [];
  const chatIds = Array.from(new Set([...fromDb, ...envChatIds()]));
  return {
    enabled: row?.enabled !== false,
    chatIds,
  };
}

export async function getTelegramNotifySettings(): Promise<TelegramNotifySettings> {
  try {
    return await withClient(readSettings);
  } catch (err) {
    console.error("[telegram:settings:get]", err);
    return { enabled: true, chatIds: envChatIds() };
  }
}

export async function setTelegramNotifyEnabled(enabled: boolean): Promise<TelegramNotifySettings> {
  return withClient(async (client) => {
    await client.query(
      `UPDATE telegram_notify_settings
       SET enabled = $1, updated_at = now()
       WHERE id = 1`,
      [enabled],
    );
    return readSettings(client);
  });
}

export async function addTelegramChatId(chatId: string | number): Promise<TelegramNotifySettings> {
  const id = String(chatId).trim();
  if (!id) return getTelegramNotifySettings();
  return withClient(async (client) => {
    await client.query(
      `UPDATE telegram_notify_settings
       SET chat_ids = (
         SELECT ARRAY(SELECT DISTINCT unnest(COALESCE(chat_ids, '{}') || $1::text[]))
       ),
       updated_at = now()
       WHERE id = 1`,
      [[id]],
    );
    return readSettings(client);
  });
}
