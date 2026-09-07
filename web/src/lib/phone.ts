/** Нормализация телефона РФ к виду +7XXXXXXXXXX */
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;

  let normalized = digits;
  if (normalized.length === 11 && normalized.startsWith("8")) {
    normalized = `7${normalized.slice(1)}`;
  }
  if (normalized.length === 10) {
    normalized = `7${normalized}`;
  }
  if (normalized.length !== 11 || !normalized.startsWith("7")) {
    return null;
  }

  return `+${normalized}`;
}

/**
 * Маска ввода для модалки: если начинают с 7 или 8 — сразу подставляем +7.
 * Дальше держим формат +7XXXXXXXXXX (до 11 цифр).
 */
export function formatPhoneInput(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) {
    return raw.includes("+") ? "+" : "";
  }

  let national = digits;
  if (national.startsWith("7") || national.startsWith("8")) {
    national = national.slice(1);
  }

  const full = `7${national}`.slice(0, 11);
  return `+${full}`;
}

export function formatPhoneDisplay(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.length !== 11) return phone;
  return `+${d[0]} (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9, 11)}`;
}
