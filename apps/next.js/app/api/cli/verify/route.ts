import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { authToken } from "@/db/schema";
import { decrypt } from "@/lib/crypto";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const authPhraseId = url.searchParams.get("auth_phrase_id");

  if (!authPhraseId) {
    return NextResponse.json(
      { error: "Auth phrase ID is required" },
      { status: 400 }
    );
  }

  const authToken_ = await db.query.authToken.findFirst({
    where: eq(authToken.authPhraseId, authPhraseId),
  });

  if (!authToken_) {
    return NextResponse.json(
      { error: "Auth token not found" },
      { status: 404 }
    );
  }

  const decryptedToken = decrypt(
    authToken_.token,
    process.env.AUTH_TOKEN_ENCRYPTION_KEY!
  );

  return NextResponse.json({ token: decryptedToken });
}
