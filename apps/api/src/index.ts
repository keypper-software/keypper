import { serve } from "@hono/node-server";
import { Hono } from "hono";
import type { Context } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { db } from "./db";
import { apiKey } from "./db/schema";
import { eq } from "drizzle-orm";
const app = new Hono();

const apiKeyData = {
  id: "120-33-e03-3030-03030",
  projects: ["project1", "project2"],
};

app.use(
  "/:workspaceSlug/:projectSlug/*",
  bearerAuth({
    verifyToken: async (token, c) => {
      const { workspaceSlug, projectSlug } = c.req.param();

      if (!apiKeyData.projects.includes(projectSlug)) {
        return false;
      }

      return true;

      // const [apiKey_] = await db
      //   .select()
      //   .from(apiKey)
      //   .where(eq(apiKey.key, token));

      // if (!apiKey_.projects?.includes(projectSlug)) {
      //   return false;
      // }

      // return true;
    },
  })
);

app.get("/:workspaceSlug/:projectSlug/secrets", (c) => {
  const secrets = [
    {
      id: "1",
      name: "secret1",
      value: "secret1",
    },
  ];

  return c.json(secrets);
});

serve(
  {
    fetch: app.fetch,
    port: 9876,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
