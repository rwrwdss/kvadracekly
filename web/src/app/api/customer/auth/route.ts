import { NextRequest, NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";
import { normalizePhone } from "@/lib/phone";
import { buildProgress } from "@/lib/booking/progress";
import {
  CUSTOMER_COOKIE,
  customerCookieOptions,
  decodeCustomerSession,
  encodeCustomerSession,
} from "@/lib/customer-session";

export async function GET(req: NextRequest) {
  const session = decodeCustomerSession(req.cookies.get(CUSTOMER_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ authenticated: false });
  }

  try {
    const payload = await getPayloadClient();
    const customer = await payload.findByID({
      collection: "customers",
      id: session.customerId,
      depth: 0,
      overrideAccess: true,
    });

    return NextResponse.json({
      authenticated: true,
      phone: session.phone,
      name: customer?.name || session.name,
      customerId: session.customerId,
      progress: buildProgress(customer?.completedThrough),
      known: true,
    });
  } catch {
    return NextResponse.json({
      authenticated: true,
      phone: session.phone,
      name: session.name,
      customerId: session.customerId,
      progress: buildProgress(0),
      known: false,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { phone?: string; name?: string };
    const name = String(body.name || "").trim();
    const phone = normalizePhone(String(body.phone || ""));

    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Укажите имя (минимум 2 символа)" }, { status: 400 });
    }
    if (!phone) {
      return NextResponse.json({ error: "Укажите корректный телефон" }, { status: 400 });
    }

    const payload = await getPayloadClient();
    const found = await payload.find({
      collection: "customers",
      where: { phone: { equals: phone } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });

    let customerId: number | string;
    let completedThrough = 0;

    if (found.docs[0]) {
      customerId = found.docs[0].id;
      completedThrough = Number(found.docs[0].completedThrough || 0);
      await payload.update({
        collection: "customers",
        id: customerId,
        data: { name },
        overrideAccess: true,
      });
    } else {
      const created = await payload.create({
        collection: "customers",
        data: {
          name,
          phone,
          completedThrough: 0,
        },
        overrideAccess: true,
      });
      customerId = created.id;
    }

    const token = encodeCustomerSession({ phone, name, customerId });
    const res = NextResponse.json({
      authenticated: true,
      phone,
      name,
      customerId,
      progress: buildProgress(completedThrough),
      known: Boolean(found.docs[0]),
      created: !found.docs[0],
    });
    res.cookies.set(customerCookieOptions(token));
    return res;
  } catch (err) {
    console.error("[CUSTOMER AUTH]", err);
    return NextResponse.json({ error: "Не удалось войти. Попробуйте ещё раз." }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ authenticated: false });
  res.cookies.set({
    name: CUSTOMER_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
