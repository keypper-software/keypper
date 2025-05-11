import { NextResponse } from "next/server";
import { z } from "zod";
import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import axios from "axios";

export async function POST(request: Request) {
  const api = axios.create({
    baseURL: process.env.API_URL || "http://localhost:3001",
    headers: {
      Cookie: request.headers.get("Cookie"),
    },
  });

  try {
    const { messages, workspaceSlug, selectedProject, selectedEnvironment } =
      await request.json();

    if (!workspaceSlug) {
      return NextResponse.json(
        { error: "No workspace selected" },
        { status: 400 }
      );
    }

    const result = streamText({
      model: google("gemini-2.5-pro-exp-03-25"),
      messages,
      tools: {
        // Workspace Project Management
        listOrCreateProjects: {
          description: "List or create projects in a workspace",
          parameters: z.object({
            action: z.enum(["list", "create"]),
            name: z.string().optional(),
            description: z.string().optional(),
          }),
          execute: async ({ action, name, description }) => {
            if (action === "list") {
              const response = await api.get(`/api/${workspaceSlug}/projects`);
              return JSON.stringify(response.data, null, 2);
            } else {
              const response = await api.post(
                `/api/${workspaceSlug}/projects`,
                {
                  name,
                  description,
                }
              );
              return JSON.stringify(response.data, null, 2);
            }
          },
        },

        // Project Details and Secrets
        getProjectDetails: {
          description: "Get project details or reveal secrets",
          parameters: z.object({}),
          execute: async () => {
            if (!selectedProject) {
              throw new Error("No project selected");
            }
            const response = await api.post(
              `/api/${workspaceSlug}/${selectedProject}`,
              {
                environmentName: selectedEnvironment || "Development",
                branchName: "main",
              }
            );
            return JSON.stringify(response.data, null, 2);
          },
        },

        // Secrets Management
        manageSecrets: {
          description:
            "Manage project secrets. Use 'list' to see all secrets, 'get' to see a specific secret, 'create' to add a new secret, or 'update' to modify an existing secret.",
          parameters: z.object({
            action: z.enum(["list", "get", "create", "update"]),
            secretName: z.string().optional(),
            secretValue: z.string().optional(),
          }),
          execute: async ({ action, secretName, secretValue }) => {
            if (!selectedProject) {
              throw new Error("No project selected");
            }

            if (action === "list") {
              try {
                const url = `/api/${workspaceSlug}/${selectedProject}/secrets`;
                const params = {
                  environment: selectedEnvironment || "Development",
                  branch: "main",
                };
                const response = await api.get(url, { params });
                return JSON.stringify({
                  component: "secretsTable",
                  data: response.data,
                });
              } catch (error) {}
            }

            if (!secretName) {
              throw new Error(
                "Secret name is required for get, create, or update operations"
              );
            }

            const url = `/api/${workspaceSlug}/${selectedProject}/secrets`;
            const params = {
              environment: selectedEnvironment || "Development",
              branch: "main",
            };

            let response;
            if (action === "get") {
              response = await api.get(`${url}/${secretName}`, { params });
            } else if (action === "create") {
              response = await api.post(
                url,
                { name: secretName, value: secretValue },
                { params }
              );
            } else {
              response = await api.put(
                url,
                { name: secretName, value: secretValue },
                { params }
              );
            }

            return JSON.stringify({
              component: "secretsTable",
              data: response.data,
            });
          },
        },

        // Delete Secret
        deleteSecret: {
          description: "Delete a specific secret by its ID",
          parameters: z.object({
            secretId: z.string(),
          }),
          execute: async ({ secretId }) => {
            if (!selectedProject) {
              throw new Error("No project selected");
            }
            const response = await api.delete(
              `/api/${workspaceSlug}/${selectedProject}/secrets/${secretId}`
            );
            return JSON.stringify(response.data, null, 2);
          },
        },

        // Workspace Invitations
        manageInvitations: {
          description: "Send or view workspace invitations",
          parameters: z.object({
            action: z.enum(["list", "send"]),
            emails: z.array(z.string()).optional(),
          }),
          execute: async ({ action, emails }) => {
            if (action === "list") {
              const response = await api.get(
                `/api/${workspaceSlug}/invitation`
              );
              return JSON.stringify(response.data, null, 2);
            } else {
              const response = await api.post(
                `/api/${workspaceSlug}/invitation`,
                {
                  emails,
                }
              );
              return JSON.stringify(response.data, null, 2);
            }
          },
        },

        // Ping
        ping: {
          description: "Simple ping endpoint for testing",
          parameters: z.object({}),
          execute: async () => {
            const response = await api.get("/api/ping");
            return JSON.stringify(response.data, null, 2);
          },
        },
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
