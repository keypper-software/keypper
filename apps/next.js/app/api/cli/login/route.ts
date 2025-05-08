import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { authPhrase } from "@/db/schema";
import boringNameGenerator from "boring-name-generator";

export async function POST(request: Request) {
  try {
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

    return NextResponse.json({
      id: authPhrase_.id,
      phrase: authPhrase_.phrase,
      expiresAt: authPhrase_.expiresAt,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
