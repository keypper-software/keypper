import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import {
  secret,
  member,
  branch,
  environment,
  project,
  secretVersion,
} from "@/db/schema";
import { auth } from "@/lib/auth";

export async function DELETE(
  request: Request,
  {
    params,
  }: {
    params: { workspaceSlug: string; projectSlug: string; secretId: string };
  }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const secret_ = await db.query.secret.findFirst({
      where: (secret, { eq }) => eq(secret.id, params.secretId),
    });

    if (!secret_) {
      return NextResponse.json(
        {
          message: "Secret not found",
        },
        { status: 404 }
      );
    }

    // Get the branch associated with the secret
    const branch_ = await db.query.branch.findFirst({
      where: (branch, { eq }) => eq(branch.id, secret_.branchId),
    });

    if (!branch_) {
      return NextResponse.json(
        {
          message: "Branch not found",
        },
        { status: 404 }
      );
    }

    // Get the environment associated with the branch
    const environment_ = await db.query.environment.findFirst({
      where: (environment, { eq }) => eq(environment.id, branch_.environmentId),
    });

    if (!environment_) {
      return NextResponse.json(
        {
          message: "Environment not found",
        },
        { status: 404 }
      );
    }

    // Get the project associated with the environment
    const project_ = await db.query.project.findFirst({
      where: (project, { eq }) => eq(project.id, environment_.projectId),
    });

    if (!project_) {
      return NextResponse.json(
        {
          message: "Project not found",
        },
        { status: 404 }
      );
    }

    // Get organization from the workspace slug
    const organization = await db.query.organization.findFirst({
      where: (org, { eq }) => eq(org.slug, params.workspaceSlug),
      columns: {
        id: true,
      },
    });

    if (!organization) {
      return NextResponse.json(
        {
          message: "Workspace not found",
        },
        { status: 404 }
      );
    }

    // Verify project belongs to the organization
    if (project_.organizationId !== organization.id) {
      return NextResponse.json(
        {
          message: "Secret does not belong to this workspace",
        },
        { status: 403 }
      );
    }

    // Check if user is a member of the organization
    const isMember = await db.query.member.findFirst({
      where: (member, { eq, and }) =>
        and(
          eq(member.organizationId, organization.id),
          eq(member.userId, session.user.id)
        ),
    });

    if (!isMember) {
      return NextResponse.json(
        {
          message: "You are not a member of this workspace",
        },
        { status: 403 }
      );
    }

    await db.transaction(async (tx) => {
      // Delete the secret version
      await tx
        .delete(secretVersion)
        .where(eq(secretVersion.secretId, params.secretId));

      // Delete the secret
      await tx.delete(secret).where(eq(secret.id, params.secretId));
    });

    return NextResponse.json(
      {
        message: "Secret deleted",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting secret:", error);
    return NextResponse.json(
      {
        message: "Error deleting secret",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
