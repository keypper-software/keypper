import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/start/api";

export const APIRoute = createAPIFileRoute("/api/ai/test")({
  GET: ({ request, params }) => {
    return json({ message: 'Hello "/api/ai/test"!' });
  },
});
