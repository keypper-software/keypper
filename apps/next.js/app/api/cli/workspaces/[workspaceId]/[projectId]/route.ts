import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { authToken, project } from "@/db/schema";
import { hash } from "@/lib/crypto";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspaceId");

  if (!workspaceId) {
    return NextResponse.json(
      { error: "Workspace ID is required" },
      { status: 400 }
    );
  }

  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plainToken = authHeader.split("Bearer ")[1].trim();

  if (!plainToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tokenHash = hash(plainToken);

  const validToken = await db.query.authToken.findFirst({
    where: eq(authToken.tokenHash, tokenHash),
  });

  if (!validToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projects = await db.query.project.findMany({
    where: eq(project.organizationId, workspaceId),
    columns: {
      id: true,
      name: true,
    },
  });

  return NextResponse.json(projects);
}
