import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { authToken, authPhrase } from "@/db/schema";
import { auth } from "@/lib/auth";
import { encrypt, hash } from "@/lib/crypto";

export async function POST(request: Request) {
  const { authPhraseId, name, machineName, operatingSystem } =
    await request.json();

  if (!authPhraseId || !name || !machineName || !operatingSystem) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const _authPhrase = await db.query.authPhrase.findFirst({
    where: eq(authPhrase.id, authPhraseId),
  });

  if (!_authPhrase) {
    return NextResponse.json(
      { error: "Auth phrase not found" },
      { status: 404 }
    );
  }

  if (_authPhrase.isUsed) {
    return NextResponse.json(
      { error: "Auth phrase already used" },
      { status: 400 }
    );
  }

  const plainToken = nanoid();

  const encryptedToken = encrypt(
    plainToken,
    process.env.AUTH_TOKEN_ENCRYPTION_KEY!
  );
  const hashedToken = hash(plainToken);

  await db.insert(authToken).values({
    id: nanoid(),
    token: encryptedToken,
    tokenHash: hashedToken,
    firstFourCharacters: plainToken.slice(0, 4),
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

  return NextResponse.json({ message: "Token created successfully" });
}
