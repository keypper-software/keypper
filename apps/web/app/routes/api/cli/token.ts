import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { nanoid } from "nanoid";
import { db } from "~/db";
import { authToken } from "~/db/schema";
import { auth } from "~/lib/auth";
import { encrypt } from "~/lib/crypto";

export const APIRoute = createAPIFileRoute("/api/cli/token")({
  POST: async ({ request, params }) => {
    const { authPhraseId, name, machineName, operatingSystem } =
      await request.json();

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    await db.insert(authToken).values({
      id: nanoid(),
      token: encrypt(nanoid(), process.env.AUTH_TOKEN_ENCRYPTION_KEY!),
      name,
      type: "cli",
      machineName,
      operatingSystem,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: session.user.id,
      authPhraseId,
    });

    return json({ message: "Token created successfully" });
  },
});
