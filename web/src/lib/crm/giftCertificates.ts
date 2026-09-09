import { randomBytes } from "crypto";
import type { Payload } from "payload";
import { ROUTES } from "@/data/site";

export function makeCertificateSlug(): string {
  return randomBytes(6).toString("hex");
}

export function resolveRoute(routeSlug: string) {
  const route = ROUTES.find((r) => r.slug === routeSlug || r.title === routeSlug);
  if (!route) return null;
  return { slug: route.slug, title: route.title, price: route.price };
}

export function defaultValidUntil(from = new Date()): string {
  const d = new Date(from);
  d.setMonth(d.getMonth() + 3);
  return d.toISOString();
}

export type CreateGiftCertificateInput = {
  firstName: string;
  lastName: string;
  routeSlug: string;
  notes?: string;
  createdById?: number | string;
};

export async function createGiftCertificate(
  payload: Payload,
  input: CreateGiftCertificateInput,
) {
  const firstName = String(input.firstName || "").trim();
  const lastName = String(input.lastName || "").trim();
  if (firstName.length < 2) {
    return { ok: false as const, status: 400, error: "Укажите имя (минимум 2 символа)" };
  }
  if (lastName.length < 2) {
    return { ok: false as const, status: 400, error: "Укажите фамилию (минимум 2 символа)" };
  }

  const route = resolveRoute(String(input.routeSlug || "").trim());
  if (!route) {
    return { ok: false as const, status: 400, error: "Выберите маршрут" };
  }

  let slug = makeCertificateSlug();
  for (let i = 0; i < 5; i++) {
    const existing = await payload.find({
      collection: "gift-certificates",
      where: { slug: { equals: slug } },
      limit: 1,
      overrideAccess: true,
    });
    if (!existing.docs.length) break;
    slug = makeCertificateSlug();
  }

  const createdBy =
    input.createdById === undefined || input.createdById === null
      ? undefined
      : Number(input.createdById);

  const doc = await payload.create({
    collection: "gift-certificates",
    overrideAccess: true,
    data: {
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      slug,
      routeSlug: route.slug,
      routeTitle: route.title,
      status: "active",
      validUntil: defaultValidUntil(),
      createdBy: Number.isFinite(createdBy) ? createdBy : undefined,
      notes: input.notes?.trim() || undefined,
    },
  });

  return {
    ok: true as const,
    id: doc.id,
    slug: doc.slug as string,
    url: `/sertifikat/${doc.slug}`,
  };
}

export async function listGiftCertificates(payload: Payload, limit = 48) {
  const result = await payload.find({
    collection: "gift-certificates",
    sort: "-createdAt",
    limit,
    depth: 0,
    overrideAccess: true,
  });
  return result.docs;
}
