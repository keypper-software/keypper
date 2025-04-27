import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { eq } from "drizzle-orm";
import { db } from "~/db";
import { authToken } from "~/db/schema";
import { decrypt } from "~/lib/crypto";
export const APIRoute = createAPIFileRoute("/api/cli/verify")({
  GET: async ({ request, params }) => {
    const url = new URL(request.url);
    const authPhraseId = url.searchParams.get("auth_phrase_id");

    if (!authPhraseId) {
      return json({ error: "Auth phrase ID is required" }, { status: 400 });
    }

    const authToken_ = await db.query.authToken.findFirst({
      where: eq(authToken.authPhraseId, authPhraseId),
    });

    if (!authToken_) {
      return json({ error: "Auth token not found" }, { status: 404 });
    }

    const decryptedToken = decrypt(
      authToken_.token,
      process.env.AUTH_TOKEN_ENCRYPTION_KEY!
    );

    return json({ token: decryptedToken });
  },
});
