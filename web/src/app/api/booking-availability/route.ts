import { NextRequest, NextResponse } from "next/server";
import { getPayloadClient } from "@/lib/payload";
import { BOOKING_SLOTS } from "@/lib/booking/slots";
import { buildMonthAvailability } from "@/lib/booking/availability";

/**
 * GET /api/booking-availability?month=2026-09
 * Occupancy for the site calendar (no PII). Driven by CMS leads + site-settings.booking.
 */
export async function GET(req: NextRequest) {
  try {
    const monthParam = req.nextUrl.searchParams.get("month") || "";
    const monthMatch = /^(\d{4})-(\d{2})$/.exec(monthParam);
    const now = new Date();
    const year = monthMatch ? Number(monthMatch[1]) : now.getFullYear();
    const monthIndex = monthMatch ? Number(monthMatch[2]) - 1 : now.getMonth();

    if (monthIndex < 0 || monthIndex > 11 || year < 2020 || year > 2100) {
      return NextResponse.json({ error: "Некорректный месяц" }, { status: 400 });
    }

    const payload = await getPayloadClient();
    const { settings, days, fromKey, toKey } = await buildMonthAvailability(
      payload,
      year,
      monthIndex,
    );

    return NextResponse.json({
      month: `${year}-${String(monthIndex + 1).padStart(2, "0")}`,
      enabled: settings.enabled,
      capacity: settings.slotCapacity,
      slots: [...BOOKING_SLOTS],
      days,
      range: { from: fromKey, to: toKey },
    });
  } catch (err) {
    console.error("[BOOKING_AVAILABILITY]", err);
    return NextResponse.json(
      {
        month: req.nextUrl.searchParams.get("month") || "",
        enabled: true,
        capacity: 3,
        slots: [...BOOKING_SLOTS],
        days: {},
        offline: true,
      },
      { status: 200 },
    );
  }
}
