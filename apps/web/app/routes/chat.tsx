import { createFileRoute } from "@tanstack/react-router";
import { ToolInvocation } from "ai";
import { useChat } from "@ai-sdk/react";
import { Textarea } from "~/components/interface/textarea";
import { Input } from "~/components/interface/input";

export const Route = createFileRoute("/chat")({
  component: RouteComponent,
});

export default function RouteComponent() {
  const { messages, input, handleInputChange, handleSubmit, addToolResult } =
    useChat({
      maxSteps: 5,
      api: "/api/ai/chat",
    });

  return (
    <div className="flex flex-col h-screen p-4">
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
                                  {part.toolInvocation.args.workspaceSlug}
                                </div>
                              ) : (
                                <div>
                                  Creating project{" "}
                                  {part.toolInvocation.args.name} in workspace{" "}
                                  {part.toolInvocation.args.workspaceSlug}
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
                              Fetching details for project{" "}
                              {part.toolInvocation.args.projectSlug} in
                              workspace {part.toolInvocation.args.workspaceSlug}
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
                                  Fetching secrets for project{" "}
                                  {part.toolInvocation.args.projectSlug}
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
                              {part.toolInvocation.args.projectSlug}
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
                                  {part.toolInvocation.args.workspaceSlug}
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
