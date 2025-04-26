import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";

export const APIRoute = createAPIFileRoute(
  "/api/$workspaceSlug/$projectSlug/secrets/$secretKey"
)({
  GET: ({ request, params }) => {
    return json({
      message: 'Hello "/api/$workspaceSlug/$projectSlug/secrets/$secretKey"!',
    });
  },
});
