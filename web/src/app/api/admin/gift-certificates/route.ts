import { NextRequest, NextResponse } from "next/server";
import { headers as getHeaders } from "next/headers";
import { getPayload } from "payload";
import config from "@payload-config";
import { isStaff } from "@/access/roles";
import {
  createGiftCertificate,
  listGiftCertificates,
} from "@/lib/crm/giftCertificates";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** GET /api/admin/gift-certificates — список для CRM. */
export async function GET() {
  const payload = await getPayload({ config });
  const headers = await getHeaders();
  const { user } = await payload.auth({ headers });
  if (!isStaff(user) || !user) {
    return NextResponse.json({ error: "Нужна авторизация" }, { status: 401 });
  }

  try {
    const docs = await listGiftCertificates(payload);
    return NextResponse.json({
      ok: true,
      docs: docs.map((doc) => ({
        id: doc.id,
        firstName: doc.firstName,
        lastName: doc.lastName,
        fullName: doc.fullName,
        slug: doc.slug,
        routeTitle: doc.routeTitle,
        routeSlug: doc.routeSlug,
        status: doc.status,
        validUntil: doc.validUntil,
        createdAt: doc.createdAt,
        url: `/sertifikat/${doc.slug}`,
      })),
    });
  } catch (err) {
    console.error("[ADMIN_GIFT_CERT_LIST]", err);
    return NextResponse.json({ error: "Не удалось загрузить список" }, { status: 500 });
  }
}

/** POST /api/admin/gift-certificates — создать сертификат. */
export async function POST(req: NextRequest) {
  const payload = await getPayload({ config });
  const headers = await getHeaders();
  const { user } = await payload.auth({ headers });
  if (!isStaff(user) || !user) {
    return NextResponse.json({ error: "Нужна авторизация" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as {
      firstName?: string;
      lastName?: string;
      routeSlug?: string;
      notes?: string;
    };

    const result = await createGiftCertificate(payload, {
      firstName: body.firstName || "",
      lastName: body.lastName || "",
      routeSlug: body.routeSlug || "",
      notes: body.notes,
      createdById: user.id,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      ok: true,
      id: result.id,
      slug: result.slug,
      url: result.url,
    });
  } catch (err) {
    console.error("[ADMIN_GIFT_CERT_CREATE]", err);
    return NextResponse.json({ error: "Не удалось создать сертификат" }, { status: 500 });
  }
}
