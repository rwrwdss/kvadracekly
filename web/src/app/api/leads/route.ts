import { NextRequest, NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";

type LeadBody = {
  name?: string;
  phone?: string;
  date?: string;
  route?: string;
  message?: string;
  source?: string;
  tariff?: string;
  productId?: string | number;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    content?: string;
    term?: string;
  };
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as LeadBody;
    const name = body.name?.trim();
    const phone = body.phone?.trim();

    if (!name || !phone) {
      return NextResponse.json({ error: "name and phone required" }, { status: 400 });
    }

    const payload = await getPayloadClient();
    const lead = await payload.create({
      collection: "leads",
      data: {
        name,
        phone,
        date: body.date || "",
        route: body.route || "",
        message: body.message || "",
        source: body.source || "booking_modal",
        tariff: body.tariff || "",
        status: "new",
        utm: body.utm || {},
        ...(body.productId ? { product: body.productId } : {}),
      },
    });

    return NextResponse.json({ ok: true, id: lead.id });
  } catch (err) {
    console.error("[LEAD]", err);
    return NextResponse.json(
      { error: "Не удалось сохранить заявку. Проверьте CMS." },
      { status: 500 },
    );
  }
}
