import { NextRequest, NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";
import { normalizePhone } from "@/lib/phone";
import { buildProgress } from "@/lib/booking/progress";

/**
 * GET /api/progress?phone=+7900…
 * Публично: только прогресс трасс по телефону (без имени/заметок).
 */
export async function GET(req: NextRequest) {
  try {
    const phone = normalizePhone(req.nextUrl.searchParams.get("phone") || "");
    if (!phone) {
      return NextResponse.json({
        ...buildProgress(0),
        known: false,
      });
    }

    const payload = await getPayloadClient();
    const found = await payload.find({
      collection: "customers",
      where: { phone: { equals: phone } },
      limit: 1,
      depth: 0,
    });

    const customer = found.docs[0];
    if (!customer) {
      return NextResponse.json({
        ...buildProgress(0),
        known: false,
      });
    }

    return NextResponse.json({
      ...buildProgress(customer.completedThrough),
      known: true,
    });
  } catch (err) {
    console.error("[PROGRESS]", err);
    return NextResponse.json({
      ...buildProgress(0),
      known: false,
      offline: true,
    });
  }
}
