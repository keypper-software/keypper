import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { nanoid } from "nanoid";
import { db } from "~/db";
import { authPhrase } from "~/db/schema";
import boringNameGenerator from "boring-name-generator";

export const APIRoute = createAPIFileRoute("/api/cli/login")({
  POST: async ({ request, params }) => {
    const { userName, machineName, operatingSystem } = await request.json();

    const [authPhrase_] = await db
      .insert(authPhrase)
      .values({
        id: nanoid(),
        userName,
        machineName,
        operatingSystem,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 5),
        phrase: boringNameGenerator({ words: 6 }).dashed,
      })
      .returning();

    return json({
      id: authPhrase_.id,
      phrase: authPhrase_.phrase,
      expiresAt: authPhrase_.expiresAt,
    });
  },
});
