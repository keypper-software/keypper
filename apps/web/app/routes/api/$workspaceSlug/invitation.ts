import { json } from "@tanstack/start";
import { createAPIFileRoute } from "@tanstack/start/api";
import { db } from "~/db";
import { authClient } from "~/lib/auth-client";

export const APIRoute = createAPIFileRoute("/api/$workspaceSlug/invitation")({
  GET: ({ request, params }) => {
    return json({ message: 'Hello "/api/$workspaceSlug/invite"!' });
  },

  POST: async ({ request, params }) => {
    const body = (await request.json()) as {
      emails: string[];
    };

    try {
      const organization = await db.query.organization.findFirst({
        where: (org, { eq }) => eq(org.slug, params.workspaceSlug),
        columns: {
          id: true,
        },
      });

      if (!organization) {
        return json({ message: "Organization not found" }, { status: 404 });
      }

      body.emails.forEach(async (email) => {
        await authClient.organization.inviteMember({
          email,
          role: "member",
        });
      });

      return json({ message: "Invitation sent" });
    } catch (error) {
      console.log(
        "==============================================================="
      );
      console.error("Error sending invitation:", error);
      console.log(
        "==============================================================="
      );
      return json({ message: "Error sending invitation" }, { status: 500 });
    }
  },
});
