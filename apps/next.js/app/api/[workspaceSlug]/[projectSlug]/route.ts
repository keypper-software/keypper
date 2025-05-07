import { NextResponse } from "next/server";
import { db } from "@/db";
import { auth } from "@/lib/auth";
import { createDecipheriv, scryptSync } from "crypto";
import dotenv from "dotenv";

dotenv.config();

function decrypt(text: string, secretKey: string) {
  const [iv, encryptedText] = text.split(":");
  const key = scryptSync(secretKey, "salt", 32);
  const decipher = createDecipheriv("aes-256-ctr", key, Buffer.from(iv, "hex"));
  const decryptedText = Buffer.concat([
    decipher.update(Buffer.from(encryptedText, "hex")),
    decipher.final(),
  ]);
  return decryptedText.toString();
}

export async function GET(
  request: Request,
  { params }: { params: { workspaceSlug: string; projectSlug: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const project = await db.query.project.findFirst({
      where: (project, { eq }) => eq(project.slug, params.projectSlug),
      columns: {
        id: true,
        name: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const environments = await db.query.environment.findMany({
      where: (environment, { eq }) => eq(environment.projectId, project.id),
      columns: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ name: project.name, environments });
  } catch (error) {
    console.error("Error revealing secrets:", error);
    return NextResponse.json(
      {
        error: "Failed to reveal secrets",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { workspaceSlug: string; projectSlug: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { environmentName = "Development", branchName = "main" } = body;

    const project = await db.query.project.findFirst({
      where: (project, { eq }) => eq(project.slug, params.projectSlug),
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const environment = await db.query.environment.findFirst({
      where: (env, { eq, and }) =>
        and(eq(env.name, environmentName), eq(env.projectId, project.id)),
    });

    if (!environment) {
      return NextResponse.json(
        { error: "Environment not found" },
        { status: 404 }
      );
    }

    const branch = await db.query.branch.findFirst({
      where: (b, { eq, and }) =>
        and(eq(b.name, branchName), eq(b.environmentId, environment.id)),
    });

    if (!branch) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }

    const secrets = await db.query.secret.findMany({
      where: (s, { eq }) => eq(s.branchId, branch.id),
    });

    // Decrypt the secrets
    const secretKey = process.env.ENCRYPTION_KEY!;
    const decryptedSecrets = secrets.map((secret) => ({
      id: secret.id,
      key: secret.key,
      value: decrypt(secret.value, secretKey),
      version: secret.version,
      createdAt: secret.createdAt,
      updatedAt: secret.updatedAt,
    }));

    return NextResponse.json({
      secrets: decryptedSecrets,
      environment: environmentName,
      branch: branchName,
    });
  } catch (error) {
    console.error("Error revealing secrets:", error);
    return NextResponse.json(
      {
        error: "Failed to reveal secrets",
      },
      {
        status: 500,
      }
    );
  }
}
