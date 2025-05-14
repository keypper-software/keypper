import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";

const authenticated = new Hono();

authenticated.use(
  bearerAuth({
    verifyToken: async (token, c) => {
      return token === "dynamic-token";
    },
  })
);
export default authenticated;
