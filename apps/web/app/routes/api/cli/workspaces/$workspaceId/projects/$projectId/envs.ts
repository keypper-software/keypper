import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/start/api";
import { db } from "~/db";
import { eq } from "drizzle-orm";
import { environment, project, authToken } from "~/db/schema";
import { hash } from "~/lib/crypto";

export const APIRoute = createAPIFileRoute(
  "/api/cli/workspaces/$workspaceId/projects/$projectId/envs"
)({
  GET: async ({ request, params }) => {
    try {
      const authHeader = request.headers.get("Authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return json(
          { error: "Unauthorized: Bearer token required" },
          { status: 401 }
        );
      }

      const plainToken = authHeader.split("Bearer ")[1].trim();

      if (!plainToken) {
        return json({ error: "Unauthorized: Invalid token" }, { status: 401 });
      }

      const tokenHash = hash(plainToken);

      const validToken = await db.query.authToken.findFirst({
        where: eq(authToken.tokenHash, tokenHash),
      });

      if (!validToken) {
        return json({ error: "Unauthorized: Invalid token" }, { status: 401 });
      }

      const project_ = await db.query.project.findFirst({
        where: eq(project.id, params.projectId),
      });

      if (!project_) {
        return json({ error: "Project not found" }, { status: 404 });
      }

      const environments = await db.query.environment.findMany({
        where: eq(environment.projectId, project_.id),
        columns: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return json({ environments });
    } catch (error) {
      console.error("Error fetching environments:", error);
      return json({ error: "Failed to fetch environments" }, { status: 500 });
    }
  },
});
