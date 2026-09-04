import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const CUSTOMER_COOKIE = "volnitsa_customer";
const MAX_AGE_SEC = 60 * 60 * 24 * 60; // 60 дней

export type CustomerSession = {
  phone: string;
  name: string;
  customerId: number | string;
  exp: number;
};

function secret() {
  return process.env.PAYLOAD_SECRET || process.env.CUSTOMER_SESSION_SECRET || "volnitsa-dev-secret";
}

function sign(payloadB64: string): string {
  return createHmac("sha256", secret()).update(payloadB64).digest("base64url");
}

export function encodeCustomerSession(data: Omit<CustomerSession, "exp">): string {
  const body: CustomerSession = {
    ...data,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SEC,
  };
  const payloadB64 = Buffer.from(JSON.stringify(body), "utf8").toString("base64url");
  return `${payloadB64}.${sign(payloadB64)}`;
}

export function decodeCustomerSession(token: string | undefined | null): CustomerSession | null {
  if (!token) return null;
  const [payloadB64, sig] = token.split(".");
  if (!payloadB64 || !sig) return null;
  const expected = sign(payloadB64);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const raw = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as CustomerSession;
    if (!raw?.phone || !raw?.name || !raw?.exp) return null;
    if (raw.exp < Math.floor(Date.now() / 1000)) return null;
    return raw;
  } catch {
    return null;
  }
}

export async function readCustomerSession(): Promise<CustomerSession | null> {
  const jar = await cookies();
  return decodeCustomerSession(jar.get(CUSTOMER_COOKIE)?.value);
}

export function customerCookieOptions(token: string) {
  return {
    name: CUSTOMER_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SEC,
  };
}
