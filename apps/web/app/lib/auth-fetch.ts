import { createServerFn } from "@tanstack/react-start";
import { getWebRequest } from "vinxi/http";
import { auth } from "~/lib/auth";
import { db } from "~/db";
import { eq, and } from "drizzle-orm";
import { member, organization } from "~/db/schema";

export const fetchAuth = createServerFn({ method: "GET" }).handler(async () => {
  const session = await auth.api.getSession({
    headers: getWebRequest()!.headers,
  });

  const member_ = await db.query.member.findFirst({
    where: and(eq(member.userId, session?.user.id!)),
  });

  const organization_ = await db.query.organization.findFirst({
    where: eq(organization.id, member_?.organizationId!),
    columns: {
      slug: true,
    },
  });

  return {
    userId: session?.user.id,
    organization: organization_,
  };
});
