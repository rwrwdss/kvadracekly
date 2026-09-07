import { NextRequest, NextResponse } from "next/server";
import { headers as getHeaders } from "next/headers";
import { getPayload } from "payload";
import { revalidatePath } from "next/cache";
import config from "@payload-config";
import { isStaff } from "@/access/roles";
import { expandDateRange } from "@/lib/booking/slots";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

type BookingShape = {
  enabled?: boolean | null;
  slotCapacity?: number | null;
  slotHint?: string | null;
  closedDates?: { date?: string | null; note?: string | null; id?: string | null }[] | null;
  closedRanges?: {
    from?: string | null;
    to?: string | null;
    note?: string | null;
    id?: string | null;
  }[] | null;
};

async function requireStaff() {
  const payload = await getPayload({ config });
  const headers = await getHeaders();
  const { user } = await payload.auth({ headers });
  if (!isStaff(user)) return { payload, user: null as null };
  return { payload, user };
}

/** GET — список периодов остановки. */
export async function GET() {
  const { payload, user } = await requireStaff();
  if (!user) return NextResponse.json({ error: "Нужна авторизация" }, { status: 401 });

  const settings = await payload.findGlobal({ slug: "site-settings", depth: 0, overrideAccess: true });
  const booking = (settings as { booking?: BookingShape }).booking;
  const ranges = (booking?.closedRanges || [])
    .map((r) => ({
      id: r.id || null,
      from: String(r.from || "").trim(),
      to: String(r.to || "").trim(),
      note: r.note || "",
      days: expandDateRange(String(r.from || ""), String(r.to || "")).length,
    }))
    .filter((r) => DATE_RE.test(r.from) && DATE_RE.test(r.to));

  const singles = (booking?.closedDates || [])
    .map((r) => ({
      id: r.id || null,
      date: String(r.date || "").trim(),
      note: r.note || "",
    }))
    .filter((r) => DATE_RE.test(r.date));

  return NextResponse.json({ ranges, singles });
}

/** POST — добавить период { from, to, note? }. */
export async function POST(req: NextRequest) {
  const { payload, user } = await requireStaff();
  if (!user) return NextResponse.json({ error: "Нужна авторизация" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    from?: string;
    to?: string;
    note?: string;
  };

  let from = String(body.from || "").trim();
  let to = String(body.to || "").trim();
  if (!DATE_RE.test(from) || !DATE_RE.test(to)) {
    return NextResponse.json({ error: "Нужны даты from и to в формате ГГГГ-ММ-ДД" }, { status: 400 });
  }
  if (from > to) {
    const tmp = from;
    from = to;
    to = tmp;
  }
  const days = expandDateRange(from, to);
  if (!days.length) {
    return NextResponse.json({ error: "Пустой период" }, { status: 400 });
  }

  const settings = await payload.findGlobal({ slug: "site-settings", depth: 0, overrideAccess: true });
  const booking = { ...((settings as { booking?: BookingShape }).booking || {}) };
  const closedRanges = [...(booking.closedRanges || [])];
  closedRanges.push({
    from,
    to,
    note: String(body.note || "").trim() || `Остановка ${from} — ${to}`,
  });

  await payload.updateGlobal({
    slug: "site-settings",
    data: {
      booking: {
        ...booking,
        closedRanges,
      },
    } as never,
    overrideAccess: true,
    user,
  });

  try {
    revalidatePath("/");
    revalidatePath("/tarify");
  } catch {
    /* ignore */
  }

  return NextResponse.json({ ok: true, from, to, days: days.length });
}

/** DELETE — снять период ?id= или ?from=&to= */
export async function DELETE(req: NextRequest) {
  const { payload, user } = await requireStaff();
  if (!user) return NextResponse.json({ error: "Нужна авторизация" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  const fromQ = req.nextUrl.searchParams.get("from");
  const toQ = req.nextUrl.searchParams.get("to");
  const singleDate = req.nextUrl.searchParams.get("date");

  const settings = await payload.findGlobal({ slug: "site-settings", depth: 0, overrideAccess: true });
  const booking = { ...((settings as { booking?: BookingShape }).booking || {}) };

  if (singleDate && DATE_RE.test(singleDate)) {
    booking.closedDates = (booking.closedDates || []).filter(
      (r) => String(r.date || "").trim() !== singleDate && r.id !== id,
    );
  } else {
    booking.closedRanges = (booking.closedRanges || []).filter((r) => {
      if (id && r.id === id) return false;
      if (fromQ && toQ) {
        return !(String(r.from).trim() === fromQ && String(r.to).trim() === toQ);
      }
      return true;
    });
  }

  await payload.updateGlobal({
    slug: "site-settings",
    data: { booking } as never,
    overrideAccess: true,
    user,
  });

  try {
    revalidatePath("/");
  } catch {
    /* ignore */
  }

  return NextResponse.json({ ok: true });
}
