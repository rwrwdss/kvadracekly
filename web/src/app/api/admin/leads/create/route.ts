import { NextRequest, NextResponse } from "next/server";
import { headers as getHeaders } from "next/headers";
import { getPayload } from "payload";
import config from "@payload-config";
import { isStaff } from "@/access/roles";
import { createLead, type CreateLeadInput } from "@/lib/crm/createLead";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** POST /api/admin/leads/create — ручная заявка из CRM (менеджер/админ). */
export async function POST(req: NextRequest) {
  const payload = await getPayload({ config });
  const headers = await getHeaders();
  const { user } = await payload.auth({ headers });
  if (!isStaff(user) || !user) {
    return NextResponse.json({ error: "Нужна авторизация" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as CreateLeadInput;
    const result = await createLead(
      payload,
      {
        ...body,
        assigneeId: body.assigneeId ?? user.id,
        source: body.source?.trim() || "crm_manual",
      },
      { skipAntispam: true, skipProgressLock: true },
    );

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      ok: true,
      id: result.id,
      customerId: result.customerId,
    });
  } catch (err) {
    console.error("[ADMIN_LEAD_CREATE]", err);
    return NextResponse.json({ error: "Не удалось создать заявку" }, { status: 500 });
  }
}
