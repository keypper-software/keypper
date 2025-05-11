"use client"
import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import { useEffect } from "react";
import { useWorkspaceStore } from "@/stores/workspace";
import { Input } from "../interface/input";

export default function Chat() {
  const { currentWorkspace } = useWorkspaceStore();
  const [projects, setProjects] = useState<
    { id: string; slug: string; name: string }[]
  >([]);
  const [environments, setEnvironments] = useState<string[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>("");

  useEffect(() => {
    if (currentWorkspace) {
      // Fetch projects for the current workspace
      fetch(`/api/${currentWorkspace.slug}/projects`)
        .then((res) => res.json())
        .then((data) => setProjects(data));

      // Set default environments
      setEnvironments(["Development", "Staging", "Production"]);
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
    });

  return (
    <div className="flex flex-col h-[50vh] p-4 fixed right-0 bottom-0 w-[700px] z-[1000000] bg-black rounded-lg shadow-lg">
      <div className="flex gap-4 mb-4">
        {currentWorkspace && (
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
        )}
        {currentWorkspace && (
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
        )}
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
                                  {currentWorkspace?.name}
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
                                  {currentWorkspace?.name}
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
