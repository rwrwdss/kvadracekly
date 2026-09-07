import { NextRequest, NextResponse } from "next/server";
import { headers as getHeaders } from "next/headers";
import { getPayload } from "payload";
import config from "@payload-config";
import { isStaff } from "@/access/roles";
import { buildMonthAvailability } from "@/lib/booking/availability";
import { OCCUPYING_STATUSES } from "@/lib/booking/slots";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** GET /api/admin/calendar?month=2026-09 — занятость + заявки месяца (staff). */
export async function GET(req: NextRequest) {
  const payload = await getPayload({ config });
  const headers = await getHeaders();
  const { user } = await payload.auth({ headers });
  if (!isStaff(user)) {
    return NextResponse.json({ error: "Нужна авторизация" }, { status: 401 });
  }

  const monthParam = req.nextUrl.searchParams.get("month") || "";
  const monthMatch = /^(\d{4})-(\d{2})$/.exec(monthParam);
  const now = new Date();
  const year = monthMatch ? Number(monthMatch[1]) : now.getFullYear();
  const monthIndex = monthMatch ? Number(monthMatch[2]) - 1 : now.getMonth();

  if (monthIndex < 0 || monthIndex > 11 || year < 2020 || year > 2100) {
    return NextResponse.json({ error: "Некорректный месяц" }, { status: 400 });
  }

  const { settings, days, fromKey, toKey } = await buildMonthAvailability(
    payload,
    year,
    monthIndex,
  );

  const leads = await payload.find({
    collection: "leads",
    depth: 0,
    limit: 500,
    sort: "dateKey",
    where: {
      and: [
        { status: { in: [...OCCUPYING_STATUSES] } },
        {
          or: [
            {
              and: [
                { dateKey: { greater_than_equal: fromKey } },
                { dateKey: { less_than_equal: toKey } },
              ],
            },
          ],
        },
      ],
    },
    overrideAccess: true,
  });

  const byDay: Record<
    string,
    { id: string | number; name: string; phone: string; timeSlot?: string | null; status: string; route?: string | null }[]
  > = {};

  for (const lead of leads.docs) {
    let key = typeof lead.dateKey === "string" ? lead.dateKey : "";
    if (!key && typeof lead.date === "string") {
      const m = /^(\d{4}-\d{2}-\d{2})/.exec(lead.date);
      if (m) key = m[1];
    }
    if (!key || key < fromKey || key > toKey) continue;
    if (!byDay[key]) byDay[key] = [];
    byDay[key].push({
      id: lead.id,
      name: String(lead.name || ""),
      phone: String(lead.phone || ""),
      timeSlot: lead.timeSlot || null,
      status: String(lead.status || ""),
      route: lead.route || null,
    });
  }

  return NextResponse.json({
    month: `${year}-${String(monthIndex + 1).padStart(2, "0")}`,
    enabled: settings.enabled,
    capacity: settings.slotCapacity,
    days,
    leadsByDay: byDay,
  });
}
