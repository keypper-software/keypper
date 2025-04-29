import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { eq } from "drizzle-orm";
import { db } from "~/db";
import { authToken, project } from "~/db/schema";
import { hash } from "~/lib/crypto";

export const APIRoute = createAPIFileRoute(
  "/api/cli/workspaces/$workspaceId/projects"
)({
  GET: async ({ request, params }) => {
    const { workspaceId } = params;

    if (!workspaceId) {
      return json({ error: "Workspace ID is required" }, { status: 400 });
    }

    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const plainToken = authHeader.split("Bearer ")[1].trim();

    if (!plainToken) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const tokenHash = hash(plainToken);

    const validToken = await db.query.authToken.findFirst({
      where: eq(authToken.tokenHash, tokenHash),
    });

    if (!validToken) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await db.query.project.findMany({
      where: eq(project.organizationId, workspaceId),
      columns: {
        id: true,
        name: true,
      },
    });

    return json(projects);
  },
});
