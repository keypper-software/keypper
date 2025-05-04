import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { nanoid } from "nanoid";
import { db } from "~/db";
import { secret, auditLog, secretVersion, project } from "~/db/schema";
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
  version: number;
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

  const newSecret = {
    id: nanoid(),
    createdAt: new Date(),
    updatedAt: new Date(),
    key: inputSecret.key,
    value: encrypt(inputSecret.value, secretKey),
    branchId,
    addedBy: sessionUserId,
    version: 1,
  };

  await db.insert(secret).values(newSecret);

  await db.insert(secretVersion).values({
    id: nanoid(),
    secretId: newSecret.id,
    key: newSecret.key,
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
        where: (s, { eq, and, isNull }) =>
          and(eq(s.branchId, branch.id), isNull(s.deletedAt)),
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

      const newSecrets = body.secrets;
      await insertSecrets(
        newSecrets,
        branch.id,
        session.session.userId,
        secretKey
      );

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

  PUT: async ({ request, params }) => {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      secrets: SecretUpdate[];
    };

    const deleteSecret = async (secretData: SecretUpdate) => {
      await db
        .update(secret)
        .set({ deletedAt: new Date() })
        .where(eq(secret.id, secretData.id));
    };

    const updateSecret = async (secretData: SecretUpdate) => {
      const secretKey = process.env.ENCRYPTION_KEY;
      if (!secretKey) {
        throw new Error("Encryption key is not configured");
      }

      const existingSecret = await db.query.secret.findFirst({
        where: (s, { eq }) => eq(s.id, secretData.id),
      });

      if (!existingSecret) {
        return json({ message: "Secret not found" }, { status: 404 });
      }

      await db
        .update(secret)
        .set({
          key: secretData.key || existingSecret.key,
          value: secretData.value
            ? encrypt(secretData.value, secretKey)
            : existingSecret.value,
          version: existingSecret.version + 1,
        })
        .where(eq(secret.id, secretData.id));

      await db.insert(secretVersion).values({
        id: nanoid(),
        secretId: existingSecret.id,
        key: secretData.key || existingSecret.key,
        value: secretData.value
          ? encrypt(secretData.value, secretKey)
          : existingSecret.value,
        createdAt: new Date(),
        version: existingSecret.version + 1,
      });
    };

    for (const secret of body.secrets) {
      if (secret.shouldDelete) {
        deleteSecret(secret);
      } else {
        updateSecret(secret);
      }
    }
    return json({}, { status: 200 });
  },
});

interface SecretUpdate {
  id: string;
  environment: string;
  key: string;
  value: string;
  shouldDelete: boolean;
}
