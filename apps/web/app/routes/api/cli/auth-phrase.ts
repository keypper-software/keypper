import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/start/api";
import { and, eq } from "drizzle-orm";
import { db } from "~/db";
import { authPhrase } from "~/db/schema";

export const APIRoute = createAPIFileRoute("/api/cli/auth-phrase")({
  GET: async ({ request }) => {
    const url = new URL(request.url);
    const authPhraseParam = url.searchParams.get("auth_phrase");

    if (!authPhraseParam) {
      return json({ error: "Auth phrase is required" }, { status: 400 });
    }

    const authPhraseData = await db.query.authPhrase.findFirst({
      where: and(eq(authPhrase.phrase, authPhraseParam)),
      columns: {
        machineName: true,
        operatingSystem: true,
        id: true,
        userName: true,
      },
    });

    if (!authPhraseData) {
      return json({ error: "Invalid auth phrase" }, { status: 404 });
    }

    return json(authPhraseData);
  },
});
