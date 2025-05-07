import { NextResponse } from "next/server";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { member, organization } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const memberships = await db.query.member.findMany({
    where: eq(member.userId, session.user.id),
    columns: {
      organizationId: true,
    },
  });

  const workspaces = await db.query.organization.findMany({
    where: inArray(
      organization.id,
      memberships.map((m) => m.organizationId)
    ),
    columns: {
      id: true,
      name: true,
      slug: true,
    },
  });

  return NextResponse.json(workspaces);
}
