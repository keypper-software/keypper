import { NextResponse } from "next/server";
import { db } from "@/db";
import { authClient } from "@/lib/auth-client";

export async function GET(
  request: Request,
  { params }: { params: { workspaceSlug: string } }
) {
  return NextResponse.json({
    message: 'Hello "/api/[workspaceSlug]/invitation"!',
  });
}

export async function POST(
  request: Request,
  { params }: { params: { workspaceSlug: string } }
) {
  try {
    const body = (await request.json()) as {
      emails: string[];
    };

    const organization = await db.query.organization.findFirst({
      where: (org, { eq }) => eq(org.slug, params.workspaceSlug),
      columns: {
        id: true,
      },
    });

    if (!organization) {
      return NextResponse.json(
        { message: "Organization not found" },
        { status: 404 }
      );
    }

    // Process invitations sequentially to avoid rate limiting
    for (const email of body.emails) {
      await authClient.organization.inviteMember({
        email,
        role: "member",
      });
    }

    return NextResponse.json({ message: "Invitation sent" });
  } catch (error) {
    console.error("Error sending invitation:", error);
    return NextResponse.json(
      { message: "Error sending invitation" },
      { status: 500 }
    );
  }
}
