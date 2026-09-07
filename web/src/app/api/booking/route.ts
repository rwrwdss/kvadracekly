import { NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";
import { createLead, type CreateLeadInput } from "@/lib/crm/createLead";

export const runtime = "nodejs";

/** Публичная запись в очередь — через createLead (слот, антиспам, клиент, прогресс). */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreateLeadInput;
    const payload = await getPayloadClient();
    const result = await createLead(payload, body);

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      ok: true,
      id: result.id,
      customerId: result.customerId,
      duplicate: Boolean(result.duplicate),
    });
  } catch (err) {
    console.error("[BOOKING]", err);
    return NextResponse.json(
      { error: "Не удалось отправить заявку. Попробуйте ещё раз." },
      { status: 500 },
    );
  }
}
