import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { db } from "~/db";
import { auth } from "~/lib/auth";
import { auditLog } from "~/db/schema";
import { decrypt } from "~/lib/crypto";
import dotenv from "dotenv";
import { nanoid } from "nanoid";

dotenv.config();

export const APIRoute = createAPIFileRoute(
  "/api/$workspaceSlug/$projectSlug/secrets/reveal"
)({
  GET: async ({ request, params }) => {
    try {
      // Authenticate the user
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session) {
        return json({ message: "Unauthorized" }, { status: 401 });
      }

      // Get the secret key from the query parameters
      const url = new URL(request.url);
      const secretKey = url.searchParams.get("key");
      const environmentName = url.searchParams.get("environment");

      if (!environmentName) {
        return json({ message: "Environment is required" }, { status: 400 });
      }

      const branchName = url.searchParams.get("branch") || "main";

      if (!secretKey) {
        return json({ message: "Secret key is required" }, { status: 400 });
      }

      // Find the project
      const project = await db.query.project.findFirst({
        where: (project, { eq }) => eq(project.slug, params.projectSlug),
      });

      if (!project) {
        return json({ message: "Project not found" }, { status: 404 });
      }

      // Find the environment
      const environment = await db.query.environment.findFirst({
        where: (env, { eq, and }) =>
          and(eq(env.name, environmentName), eq(env.projectId, project.id)),
      });

      if (!environment) {
        return json({ message: "Environment not found" }, { status: 404 });
      }

      // Find the branch
      const branch = await db.query.branch.findFirst({
        where: (b, { eq, and }) =>
          and(eq(b.name, branchName), eq(b.environmentId, environment.id)),
      });

      if (!branch) {
        return json({ message: "Branch not found" }, { status: 404 });
      }

      // Find the secret in the database
      const secretRecord = await db.query.secret.findFirst({
        where: (s, { eq, and }) =>
          and(eq(s.key, secretKey), eq(s.branchId, branch.id)),
      });

      if (!secretRecord) {
        return json({ message: "Secret not found" }, { status: 404 });
      }

      // Get the encryption key from environment variables
      const encryptionKey = process.env.ENCRYPTION_KEY;
      if (!encryptionKey) {
        throw new Error("Encryption key is not configured");
      }

      // Decrypt the secret value
      const decryptedValue = decrypt(secretRecord.value, encryptionKey);

      await db.insert(auditLog).values({
        id: nanoid(),
        action: "REVEAL_SECRET",
        projectId: project.id,
        timestamp: new Date(),
        userId: session.user.id,
        details: `Revealed secret ${secretRecord.key}`,
      });
      // Return the decrypted secret value
      return json({
        id: secretRecord.id,
        key: secretRecord.key,
        value: decryptedValue,
        version: secretRecord.version,
      });
    } catch (error) {
      console.error("Error revealing secret:", error);
      return json(
        {
          message: "Failed to reveal secret",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  },
});
