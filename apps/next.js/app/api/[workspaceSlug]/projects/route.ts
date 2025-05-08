import { NextResponse } from "next/server";
import { db } from "@/db";
import { branch, environment, member, project } from "@/db/schema";
import { nanoid } from "nanoid";
import { z } from "zod";
import { auth } from "@/lib/auth";

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

export async function GET(
  request: Request,
  { params }: { params: { workspaceSlug: string } }
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const org = await db.query.organization.findFirst({
    where: (org, { eq }) => eq(org.slug, params.workspaceSlug),
    columns: {
      id: true,
    },
  });

  if (!org) {
    return NextResponse.json(
      { error: "Organization not found" },
      { status: 404 }
    );
  }

  const isMember = await db.query.member.findFirst({
    where: (member, { eq, and }) =>
      eq(member.organizationId, org.id) && eq(member.userId, session.user.id),
  });

  if (!isMember) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const projects = await db.query.project.findMany({
    where: (project, { eq }) => eq(project.organizationId, org.id),
    columns: {
      slug: true,
      name: true,
      description: true,
    },
  });

  return NextResponse.json(projects);
}

export async function POST(
  request: Request,
  { params }: { params: { workspaceSlug: string } }
) {
  const body = await request.json();
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const result = createProjectSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: "Invalid input", details: result.error.issues },
      { status: 400 }
    );
  }

  const { name, description } = result.data;

  try {
    const org = await db.query.organization.findFirst({
      where: (org, { eq }) => eq(org.slug, params.workspaceSlug),
      columns: {
        id: true,
        slug: true,
      },
    });

    if (!org) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Create new project
    const newProject = await db
      .insert(project)
      .values({
        id: nanoid(),
        name,
        slug: name.toLowerCase().replace(/ /g, "-"),
        description: description || null,
        organizationId: org.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    const environments = ["Production", "Staging", "Development"];

    // Create environments and branches
    for (const envName of environments) {
      const newEnvironment = await db
        .insert(environment)
        .values({
          id: nanoid(),
          name: envName,
          projectId: newProject[0].id,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      // Create main branch for this environment
      await db.insert(branch).values({
        id: nanoid(),
        name: "main",
        environmentId: newEnvironment[0].id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return NextResponse.json({ project: newProject[0] });
  } catch (error) {
    console.log("====================================");
    console.log(error);
    console.log("====================================");
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
