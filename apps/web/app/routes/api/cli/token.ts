import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "~/db";
import { authToken, authPhrase } from "~/db/schema";
import { auth } from "~/lib/auth";
import { encrypt } from "~/lib/crypto";

export const APIRoute = createAPIFileRoute("/api/cli/token")({
  POST: async ({ request, params }) => {
    const { authPhraseId, name, machineName, operatingSystem } =
      await request.json();

    if (!authPhraseId || !name || !machineName || !operatingSystem) {
      return json({ error: "Missing required fields" }, { status: 400 });
    }

    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const _authPhrase = await db.query.authPhrase.findFirst({
      where: eq(authPhrase.id, authPhraseId),
    });

    if (!_authPhrase) {
      return json({ error: "Auth phrase not found" }, { status: 404 });
    }

    if (_authPhrase.isUsed) {
      return json({ error: "Auth phrase already used" }, { status: 400 });
    }

    const token = nanoid();

    await db.insert(authToken).values({
      id: nanoid(),
      token: encrypt(token, process.env.AUTH_TOKEN_ENCRYPTION_KEY!),
      firstFourCharacters: token.slice(0, 4),
      name,
      type: "cli",
      machineName,
      operatingSystem,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: session.user.id,
      authPhraseId,
    });

    await db
      .update(authPhrase)
      .set({ isUsed: true })
      .where(eq(authPhrase.id, authPhraseId));

    return json({ message: "CLI token created successfully" });
  },
});
