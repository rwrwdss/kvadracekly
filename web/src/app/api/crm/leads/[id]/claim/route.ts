import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { isStaff } from "@/access/roles";
import { headers as getHeaders } from "next/headers";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  if (!id) {
    return NextResponse.json({ message: "Не указан id заявки" }, { status: 400 });
  }

  const payload = await getPayload({ config });
  const headers = await getHeaders();
  const { user } = await payload.auth({ headers });

  if (!isStaff(user)) {
    return NextResponse.json({ message: "Нужна авторизация" }, { status: 401 });
  }

  const lead = await payload.findByID({
    collection: "leads",
    id,
    depth: 0,
    overrideAccess: true,
  });

  const currentAssignee =
    typeof lead.assignee === "object" && lead.assignee
      ? lead.assignee.id
      : lead.assignee;

  if (currentAssignee) {
    return NextResponse.json(
      { message: "Заявку уже взял другой менеджер" },
      { status: 409 },
    );
  }

  const updated = await payload.update({
    collection: "leads",
    id,
    data: {
      assignee: user!.id,
      status: lead.status === "new" ? "in_progress" : lead.status,
    },
    overrideAccess: true,
    depth: 1,
    user,
  });

  return NextResponse.json({ doc: updated });
}
