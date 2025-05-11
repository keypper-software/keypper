import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { authPhrase } from "@/db/schema";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const authPhraseParam = url.searchParams.get("auth_phrase");

  if (!authPhraseParam) {
    return NextResponse.json(
      { error: "Auth phrase is required" },
      { status: 400 }
    );
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
    return NextResponse.json({ error: "Invalid auth phrase" }, { status: 404 });
  }

  return NextResponse.json(authPhraseData);
}
