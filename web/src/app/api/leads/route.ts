import { NextRequest, NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";
import { createLead, type CreateLeadInput } from "@/lib/crm/createLead";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateLeadInput;
    const payload = await getPayloadClient();
    const result = await createLead(payload, {
      ...body,
      pageUrl: body.pageUrl || req.headers.get("referer") || "",
    });

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
    console.error("[LEAD]", err);
    return NextResponse.json(
      { error: "Не удалось сохранить заявку. Попробуйте ещё раз или позвоните нам." },
      { status: 500 },
    );
  }
}
