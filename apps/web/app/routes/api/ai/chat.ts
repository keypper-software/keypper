import { json } from "@tanstack/react-start";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { z } from "zod";
import { streamText } from "ai";
import { google } from "@ai-sdk/google";

export const APIRoute = createAPIFileRoute("/api/ai/chat")({
  POST: async ({ request, params }) => {
    try {
      const { messages } = await request.json();

      const result = streamText({
        model: google("models/gemini-2.0-flash-exp"),
        messages,
        tools: {
          // Workspace Project Management
          listOrCreateProjects: {
            description: "List or create projects in a workspace",
            parameters: z.object({
              workspaceSlug: z.string(),
              action: z.enum(["list", "create"]),
              name: z.string().optional(),
              description: z.string().optional(),
            }),
            execute: async ({ workspaceSlug, action, name, description }) => {
              if (action === "list") {
                const response = await fetch(`/api/${workspaceSlug}/projects`);
                if (!response.ok) {
                  throw new Error(
                    `Failed to fetch projects: ${response.statusText}`
                  );
                }
                const data = await response.json();
                return JSON.stringify(data, null, 2);
              } else {
                const response = await fetch(`/api/${workspaceSlug}/projects`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ name, description }),
                });
                if (!response.ok) {
                  throw new Error(
                    `Failed to create project: ${response.statusText}`
                  );
                }
                const data = await response.json();
                return JSON.stringify(data, null, 2);
              }
            },
          },

          // Project Details and Secrets
          getProjectDetails: {
            description: "Get project details or reveal secrets",
            parameters: z.object({
              workspaceSlug: z.string(),
              projectSlug: z.string(),
              environmentName: z.string().optional(),
              branchName: z.string().optional(),
            }),
            execute: async ({
              workspaceSlug,
              projectSlug,
              environmentName,
              branchName,
            }) => {
              const response = await fetch(
                `/api/${workspaceSlug}/${projectSlug}`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ environmentName, branchName }),
                }
              );
              if (!response.ok) {
                throw new Error(
                  `Failed to get project details: ${response.statusText}`
                );
              }
              const data = await response.json();
              return JSON.stringify(data, null, 2);
            },
          },

          // Secrets Management
          manageSecrets: {
            description: "Manage project secrets",
            parameters: z.object({
              workspaceSlug: z.string(),
              projectSlug: z.string(),
              action: z.enum(["get", "create", "update"]),
              environment: z.string(),
              branch: z.string().optional(),
              secretName: z.string().optional(),
              secretValue: z.string().optional(),
            }),
            execute: async ({
              workspaceSlug,
              projectSlug,
              action,
              environment,
              branch,
              secretName,
              secretValue,
            }) => {
              const url = `/api/${workspaceSlug}/${projectSlug}/secrets`;
              const params = new URLSearchParams({
                environment,
                ...(branch && { branch }),
              });

              let response;
              if (action === "get") {
                response = await fetch(`${url}?${params}`);
              } else {
                response = await fetch(`${url}?${params}`, {
                  method: action === "create" ? "POST" : "PUT",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    name: secretName,
                    value: secretValue,
                  }),
                });
              }

              if (!response.ok) {
                throw new Error(
                  `Failed to ${action} secrets: ${response.statusText}`
                );
              }
              const data = await response.json();
              return JSON.stringify(data, null, 2);
            },
          },

          // Delete Secret
          deleteSecret: {
            description: "Delete a specific secret",
            parameters: z.object({
              workspaceSlug: z.string(),
              projectSlug: z.string(),
              secretId: z.string(),
            }),
            execute: async ({ workspaceSlug, projectSlug, secretId }) => {
              const response = await fetch(
                `/api/${workspaceSlug}/${projectSlug}/secrets/${secretId}`,
                {
                  method: "DELETE",
                }
              );
              if (!response.ok) {
                throw new Error(
                  `Failed to delete secret: ${response.statusText}`
                );
              }
              const data = await response.json();
              return JSON.stringify(data, null, 2);
            },
          },

          // Workspace Invitations
          manageInvitations: {
            description: "Send or view workspace invitations",
            parameters: z.object({
              workspaceSlug: z.string(),
              action: z.enum(["list", "send"]),
              emails: z.array(z.string()).optional(),
            }),
            execute: async ({ workspaceSlug, action, emails }) => {
              if (action === "list") {
                const response = await fetch(
                  `/api/${workspaceSlug}/invitation`
                );
                if (!response.ok) {
                  throw new Error(
                    `Failed to list invitations: ${response.statusText}`
                  );
                }
                const data = await response.json();
                return JSON.stringify(data, null, 2);
              } else {
                const response = await fetch(
                  `/api/${workspaceSlug}/invitation`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ emails }),
                  }
                );
                if (!response.ok) {
                  throw new Error(
                    `Failed to send invitations: ${response.statusText}`
                  );
                }
                const data = await response.json();
                return JSON.stringify(data, null, 2);
              }
            },
          },

          // Ping
          ping: {
            description: "Simple ping endpoint for testing",
            parameters: z.object({}),
            execute: async () => {
              const response = await fetch("/api/ping");
              if (!response.ok) {
                throw new Error(`Failed to ping: ${response.statusText}`);
              }
              const data = await response.json();
              return JSON.stringify(data, null, 2);
            },
          },
        },
      });

      return result.toDataStreamResponse();
    } catch (error) {
      console.error(error);
      return json({ error: "Internal server error" }, { status: 500 });
    }
  },
});
