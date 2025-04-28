import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { nanoid } from "nanoid";
import { db } from "~/db";
import { secret, auditLog, secretVersion } from "~/db/schema";
import { auth } from "~/lib/auth";
import { encrypt, decrypt } from "~/lib/crypto";
import dotenv from "dotenv";
import { count, eq } from "drizzle-orm";

dotenv.config();

// Define types for our secret objects
interface SecretInput {
  key: string;
  value: string;
}

interface SecretRecord {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  key: string;
  value: string;
  branchId: string;
  addedBy: string;
  version: string;
}

async function createNewSecret(
  inputSecret: SecretInput,
  branchId: string,
  sessionUserId: string,
  secretKey: string
): Promise<SecretRecord> {
  // Validate input
  if (!inputSecret.key || !inputSecret.value) {
    throw new Error("Secret key and value are required");
  }

  const existingSecret = await db.query.secret.findFirst({
    where: (s, { eq, and }) =>
      and(eq(s.key, inputSecret.key), eq(s.branchId, branchId)),
  });

  const newVersion = existingSecret
    ? parseInt(existingSecret.version.substring(1)) + 1
    : 1;

  const newSecret = {
    id: nanoid(),
    createdAt: new Date(),
    updatedAt: new Date(),
    key: inputSecret.key,
    value: encrypt(inputSecret.value, secretKey),
    branchId,
    addedBy: sessionUserId,
    version: `v${newVersion}`,
  };

  await db.insert(secret).values(newSecret);

  await db.insert(secretVersion).values({
    id: nanoid(),
    secretId: newSecret.id,
    value: newSecret.value,
    createdAt: new Date(),
    version: newSecret.version,
  });

  return newSecret;
}

async function insertSecrets(
  secrets: SecretInput[],
  branchId: string,
  sessionUserId: string,
  secretKey: string
): Promise<SecretRecord[]> {
  return Promise.all(
    secrets.map((secret) =>
      createNewSecret(secret, branchId, sessionUserId, secretKey)
    )
  );
}

export const APIRoute = createAPIFileRoute(
  "/api/$workspaceSlug/$projectSlug/secrets"
)({
  GET: async ({ request, params }) => {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session) {
        return json({ message: "Unauthorized" }, { status: 401 });
      }

      const project = await db.query.project.findFirst({
        where: (project, { eq }) => eq(project.slug, params.projectSlug),
      });

      if (!project) {
        return json({ message: "Project not found" }, { status: 404 });
      }

      const url = new URL(request.url);
      const environmentName = url.searchParams.get("environment");

      if (!environmentName) {
        return json({ message: "Environment is required" }, { status: 400 });
      }

      const environment = await db.query.environment.findFirst({
        where: (environment, { eq, and }) =>
          and(
            eq(environment.name, environmentName),
            eq(environment.projectId, project.id)
          ),
      });

      if (!environment) {
        return json({ message: "Environment not found" }, { status: 404 });
      }

      // Get branch from query parameter or default to "main"
      const branchName = url.searchParams.get("branch") || "main";

      const branch = await db.query.branch.findFirst({
        where: (branch, { eq, and }) =>
          and(
            eq(branch.name, branchName),
            eq(branch.environmentId, environment.id)
          ),
      });

      if (!branch) {
        return json({ message: "Branch not found" }, { status: 404 });
      }

      const secrets = await db.query.secret.findMany({
        where: (s, { eq }) => eq(s.branchId, branch.id),
      });

      const secretsCount = await db
        .select({ count: count() })
        .from(secret)
        .where(eq(secret.branchId, branch.id));

      const shouldReveal = url.searchParams.get("reveal") === "true";

      const secretKey = process.env.ENCRYPTION_KEY;
      if (!secretKey) {
        throw new Error("Encryption key is not configured");
      }

      const decryptedSecrets = secrets.map((secret) => ({
        id: secret.id,
        key: secret.key,
        value: shouldReveal ? decrypt(secret.value, secretKey) : "*".repeat(14),
        version: secret.version,
        createdAt: secret.createdAt,
        updatedAt: secret.updatedAt,
      }));

      return json({
        secrets: decryptedSecrets,
        count: secrets.length,
      });
    } catch (error) {
      console.error("Error retrieving secrets:", error);
      return json(
        {
          message: "Failed to retrieve secrets",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        {
          status: 500,
        }
      );
    }
  },
  POST: async ({ request, params }) => {
    try {
      const body = (await request.json()) as {
        secrets: SecretInput[];
      };

      // Validate input
      if (
        !body.secrets ||
        !Array.isArray(body.secrets) ||
        body.secrets.length === 0
      ) {
        return json(
          { message: "Invalid input: secrets array is required" },
          { status: 400 }
        );
      }

      // Validate each secret
      for (const secret of body.secrets) {
        if (!secret.key || !secret.value) {
          return json(
            { message: "Invalid input: each secret must have a key and value" },
            { status: 400 }
          );
        }
      }

      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session) {
        return json({ message: "Unauthorized" }, { status: 401 });
      }

      const project = await db.query.project.findFirst({
        where: (project, { eq }) => eq(project.slug, params.projectSlug),
      });

      if (!project) {
        return json({ message: "Project not found" }, { status: 404 });
      }

      const url = new URL(request.url);
      const environmentName = url.searchParams.get("environment");

      if (!environmentName) {
        return json({ message: "Environment is required" }, { status: 400 });
      }

      const environment = await db.query.environment.findFirst({
        where: (environment, { eq, and }) =>
          and(
            eq(environment.name, environmentName),
            eq(environment.projectId, project.id)
          ),
      });

      if (!environment) {
        return json({ message: "Environment not found" }, { status: 404 });
      }

      const branch = await db.query.branch.findFirst({
        where: (branch, { eq, and }) =>
          and(
            eq(branch.name, "main"),
            eq(branch.environmentId, environment.id)
          ),
      });

      if (!branch) {
        return json({ message: "Branch not found" }, { status: 404 });
      }

      const keys = body.secrets.map((secret) => secret.key);
      const existingSecrets = await db.query.secret.findMany({
        where: (s, { eq, and, inArray }) =>
          and(eq(s.branchId, branch.id), inArray(s.key, keys)),
      });

      // Check for conflicting keys
      const existingKeys = existingSecrets.map((secret) => secret.key);
      const conflictingKeys = body.secrets
        .filter((secret) => existingKeys.includes(secret.key))
        .map((secret) => secret.key);

      if (conflictingKeys.length > 0) {
        return json(
          {
            message: `Conflicting keys detected: ${conflictingKeys.join(", ")}`,
            conflictingKeys,
            error:
              "Some secrets already exist. To update existing secrets, use the PUT method instead.",
          },
          { status: 409 }
        );
      }

      const secretKey = process.env.ENCRYPTION_KEY;
      if (!secretKey) {
        throw new Error("Encryption key is not configured");
      }

      // Insert new secrets
      const newSecrets = body.secrets;
      await insertSecrets(
        newSecrets,
        branch.id,
        session.session.userId,
        secretKey
      );

      // Create audit log entry
      await db.insert(auditLog).values({
        id: nanoid(),
        action: "ADD_SECRET",
        timestamp: new Date(),
        userId: session.session.userId,
        projectId: project.id,
        details: `Added ${newSecrets.length} new secrets to branch ${branch.name} in environment ${environment.name}`,
      });

      return json(
        {
          message: "Secrets added successfully",
          added: newSecrets.length,
        },
        {
          status: 201,
        }
      );
    } catch (error) {
      console.error("Error adding secrets:", error);
      return json(
        {
          message: "Failed to add secrets",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        {
          status: 500,
        }
      );
    }
  },
});
