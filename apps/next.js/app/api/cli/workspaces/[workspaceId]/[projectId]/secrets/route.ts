import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { authToken, secret } from "@/db/schema";
import { decrypt, hash } from "@/lib/crypto";

export async function GET(
  request: NextRequest,
  { params }: { params: { workspaceId: string; projectId: string } }
) {
  const { workspaceId, projectId } = params;

  if (!workspaceId || !projectId) {
    return NextResponse.json(
      { error: "Workspace ID and project ID are required" },
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

  const url = new URL(request.url);
  const environmentId = url.searchParams.get("env_id");

  if (!environmentId) {
    return NextResponse.json(
      { message: "Environment is required" },
      { status: 400 }
    );
  }

  const environment = await db.query.environment.findFirst({
    where: (environment, { eq, and }) =>
      and(
        eq(environment.id, environmentId),
        eq(environment.projectId, projectId)
      ),
  });

  if (!environment) {
    return NextResponse.json(
      { message: "Environment not found" },
      { status: 404 }
    );
  }

  const branchName = url.searchParams.get("branch") || "main";

  const branch = await db.query.branch.findFirst({
    where: (branch, { eq, and }) =>
      and(
        eq(branch.name, branchName),
        eq(branch.environmentId, environment.id)
      ),
  });

  if (!branch) {
    return NextResponse.json({ message: "Branch not found" }, { status: 404 });
  }

  const secrets = await db.query.secret.findMany({
    where: (s, { eq }) => eq(s.branchId, branch.id),
  });

  const decryptedSecrets = secrets.map((secret) => ({
    id: secret.id,
    key: secret.key,
    value: decrypt(secret.value, process.env.ENCRYPTION_KEY!),
  }));

  return NextResponse.json({
    secrets: decryptedSecrets,
    count: secrets.length,
  });
}
