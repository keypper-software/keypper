import { createFileRoute } from "@tanstack/react-router";
import { ToolInvocation } from "ai";
import { useChat } from "@ai-sdk/react";
import { Textarea } from "~/components/interface/textarea";
import { Input } from "~/components/interface/input";
import { useWorkspaceStore } from "~/stores/workspace";
import { useState, useEffect } from "react";
import axios from "axios";

export const Route = createFileRoute("/chat")({
  component: RouteComponent,
});

export default function RouteComponent() {
  const { currentWorkspace } = useWorkspaceStore();
  const [projects, setProjects] = useState<
    { id: string; slug: string; name: string }[]
  >([]);
  const [environments, setEnvironments] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentWorkspace) {
      console.log("Current workspace:", currentWorkspace);
      // Fetch projects for the current workspace
      axios
        .get(`/api/${currentWorkspace.slug}/projects`)
        .then((response) => {
          console.log("Fetched projects:", response.data);
          setProjects(response.data);
        })
        .catch((err) => {
          console.error("Error fetching projects:", err);
          setError(err.response?.data?.message || err.message);
        });

      // Set default environments
      setEnvironments(["Development", "Staging", "Production"]);
    } else {
      console.log("No workspace selected");
      setError("Please select a workspace first");
    }
  }, [currentWorkspace]);

  const { messages, input, handleInputChange, handleSubmit, addToolResult } =
    useChat({
      maxSteps: 5,
      api: "/api/ai/chat",
      body: {
        workspaceSlug: currentWorkspace?.slug,
        selectedProject,
        selectedEnvironment,
      },
      onError: (error) => {
        console.error("Chat error:", error);
        setError(error.message);
      },
    });

  if (!currentWorkspace) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">Please select a workspace first</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen p-4">
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project
          </label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full p-2 border rounded-lg"
          >
            <option value="">Select a project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.slug}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Environment
          </label>
          <select
            value={selectedEnvironment}
            onChange={(e) => setSelectedEnvironment(e.target.value)}
            className="w-full p-2 border rounded-lg"
          >
            <option value="">Select an environment</option>
            {environments.map((env) => (
              <option key={env} value={env}>
                {env}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto mb-4">
        {messages?.map((message) => (
          <div key={message.id} className="mb-4 p-4 rounded-lg bg-gray-50/10">
            <strong className="text-gray-700">{`${message.role}: `}</strong>
            {message.parts.map((part) => {
              switch (part.type) {
                case "text":
                  return <span key={part.text}>{part.text}</span>;

                case "tool-invocation": {
                  const callId = part.toolInvocation.toolCallId;

                  switch (part.toolInvocation.toolName) {
                    case "listOrCreateProjects": {
                      switch (part.toolInvocation.state) {
                        case "call":
                          return (
                            <div key={callId} className="mt-2">
                              {part.toolInvocation.args.action === "list" ? (
                                <div>
                                  Fetching projects for workspace:{" "}
                                  {currentWorkspace.name}
                                </div>
                              ) : (
                                <div>
                                  Creating project{" "}
                                  {part.toolInvocation.args.name}
                                </div>
                              )}
                            </div>
                          );
                        case "result":
                          return (
                            <div key={callId} className="mt-2 text-green-600">
                              {part.toolInvocation.result}
                            </div>
                          );
                      }
                      break;
                    }

                    case "getProjectDetails": {
                      switch (part.toolInvocation.state) {
                        case "call":
                          return (
                            <div key={callId} className="mt-2">
                              Fetching details for project {selectedProject}
                            </div>
                          );
                        case "result":
                          return (
                            <div key={callId} className="mt-2 text-green-600">
                              {part.toolInvocation.result}
                            </div>
                          );
                      }
                      break;
                    }

                    case "manageSecrets": {
                      switch (part.toolInvocation.state) {
                        case "call":
                          return (
                            <div key={callId} className="mt-2">
                              {part.toolInvocation.args.action === "get" ? (
                                <div>
                                  Fetching secrets for project {selectedProject}
                                </div>
                              ) : (
                                <div>
                                  {part.toolInvocation.args.action === "create"
                                    ? "Creating"
                                    : "Updating"}{" "}
                                  secret {part.toolInvocation.args.secretName}
                                </div>
                              )}
                            </div>
                          );
                        case "result":
                          try {
                            const response = JSON.parse(
                              part.toolInvocation.result
                            );

                            if (
                              response.component === "secretsTable" &&
                              response.data
                            ) {
                              const secretsData = response.data;
                              return (
                                <div key={callId} className="mt-4">
                                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                    <div className="p-4 border-b border-gray-200">
                                      <h3 className="text-lg font-semibold text-gray-900">
                                        Project Secrets
                                      </h3>
                                      <p className="text-sm text-gray-500 mt-1">
                                        Total secrets: {secretsData.count}
                                      </p>
                                    </div>
                                    <div className="overflow-x-auto">
                                      <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                          <tr>
                                            <th
                                              scope="col"
                                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                              Key
                                            </th>
                                            <th
                                              scope="col"
                                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                              ID
                                            </th>
                                            <th
                                              scope="col"
                                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                              Version
                                            </th>
                                            <th
                                              scope="col"
                                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                              Last Updated
                                            </th>
                                            <th
                                              scope="col"
                                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                            >
                                              Value
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                          {secretsData.secrets.map(
                                            (secret: any) => (
                                              <tr
                                                key={secret.id}
                                                className="hover:bg-gray-50"
                                              >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                  <div className="text-sm font-medium text-gray-900">
                                                    {secret.key}
                                                  </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                  <div className="text-sm text-gray-500">
                                                    {secret.id}
                                                  </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                  <div className="text-sm text-gray-500">
                                                    {secret.version}
                                                  </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                  <div className="text-sm text-gray-500">
                                                    {new Date(
                                                      secret.updatedAt
                                                    ).toLocaleDateString()}
                                                  </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                  <div className="w-24 h-6 bg-gray-100 rounded flex items-center justify-center">
                                                    <span className="text-xs text-gray-500">
                                                      ••••••••••••
                                                    </span>
                                                  </div>
                                                </td>
                                              </tr>
                                            )
                                          )}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                          } catch (e) {
                            console.error("Error parsing response:", e);
                          }
                          return (
                            <div key={callId} className="mt-2 text-green-600">
                              {part.toolInvocation.result}
                            </div>
                          );
                      }
                      break;
                    }

                    case "deleteSecret": {
                      switch (part.toolInvocation.state) {
                        case "call":
                          return (
                            <div key={callId} className="mt-2">
                              Deleting secret{" "}
                              {part.toolInvocation.args.secretId} from project{" "}
                              {selectedProject}
                            </div>
                          );
                        case "result":
                          return (
                            <div key={callId} className="mt-2 text-green-600">
                              {part.toolInvocation.result}
                            </div>
                          );
                      }
                      break;
                    }

                    case "manageInvitations": {
                      switch (part.toolInvocation.state) {
                        case "call":
                          return (
                            <div key={callId} className="mt-2">
                              {part.toolInvocation.args.action === "list" ? (
                                <div>
                                  Fetching invitations for workspace{" "}
                                  {currentWorkspace.name}
                                </div>
                              ) : (
                                <div>
                                  Sending invitations to{" "}
                                  {part.toolInvocation.args.emails?.join(", ")}
                                </div>
                              )}
                            </div>
                          );
                        case "result":
                          return (
                            <div key={callId} className="mt-2 text-green-600">
                              {part.toolInvocation.result}
                            </div>
                          );
                      }
                      break;
                    }

                    case "ping": {
                      switch (part.toolInvocation.state) {
                        case "call":
                          return (
                            <div key={callId} className="mt-2">
                              Pinging server...
                            </div>
                          );
                        case "result":
                          return (
                            <div key={callId} className="mt-2 text-green-600">
                              {part.toolInvocation.result}
                            </div>
                          );
                      }
                      break;
                    }
                  }
                }
              }
            })}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          className="flex-1"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Send
        </button>
      </form>
    </div>
  );
}
