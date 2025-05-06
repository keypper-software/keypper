import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { eq, inArray } from "drizzle-orm";
import { db } from "~/db";
import { member, organization } from "~/db/schema";
import { auth } from "~/lib/auth";
export const APIRoute = createAPIFileRoute("/api/workspaces")({
  GET: async ({ request, params }) => {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return json({ error: "Unauthorized" }, { status: 401 });
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

    return json(workspaces);
  },
});
