import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { authToken, member, organization } from "@/db/schema";
import { hash } from "@/lib/crypto";

export async function GET(request: Request) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Unauthorized: Bearer token required" },
      { status: 401 }
    );
  }

  const plainToken = authHeader.split("Bearer ")[1].trim();

  if (!plainToken) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid token" },
      { status: 401 }
    );
  }

  const tokenHash = hash(plainToken);

  const validToken = await db.query.authToken.findFirst({
    where: eq(authToken.tokenHash, tokenHash),
  });

  if (!validToken) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid token" },
      { status: 401 }
    );
  }

  const memberships = await db.query.member.findMany({
    where: eq(member.userId, validToken.userId),
    columns: {
      organizationId: true,
    },
  });

  const workspaces: { id: string; name: string }[] = [];

  for (const membership of memberships) {
    const org = await db.query.organization.findFirst({
      where: eq(organization.id, membership.organizationId),
      columns: {
        id: true,
        name: true,
      },
    });

    if (org) {
      workspaces.push({ id: org.id, name: org.name });
    }
  }

  return NextResponse.json(workspaces);
}
