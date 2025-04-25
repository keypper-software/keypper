import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "~/components/interface/button";
import { Input } from "~/components/interface/input";
import { authClient } from "~/lib/auth-client";
import { toast } from "sonner";
import { APP_DOMAIN } from "~/lib/constants";
import Card from "~/components/interface/card";

export const Route = createFileRoute("/onboarding")({
  component: RouteComponent,
});

function RouteComponent() {
  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        const res = await authClient.getSession();
        return res.data?.user;
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error("Failed to load user data");
        throw error;
      }
    },
  });

  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceUrl, setWorkspaceUrl] = useState("");
  const [suggestedWorkspaceUrl, setSuggestedWorkspaceUrl] = useState("");
  const [isUrlManuallyEdited, setIsUrlManuallyEdited] = useState(false);

  const navigate = useNavigate();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      try {
        const res = await authClient.organization.create({
          name: workspaceName,
          slug: workspaceUrl || suggestedWorkspaceUrl,
        });
        return res;
      } catch (error) {
        console.error("Error creating organization:", error);
        toast.error("Failed to create organization");
        throw error;
      }
    },
    onSuccess: async (data) => {
      console.log(data);

      const slug = data?.data?.slug!;

      try {
        await authClient.organization.setActive({
          organizationSlug: slug,
        });

        navigate({
          to: "/$workspaceSlug/welcome",
          params: {
            workspaceSlug: slug,
          },
        });
      } catch (error) {
        console.error("Error setting active organization:", error);
        toast.error("Failed to set active organization");
      }
    },
  });

  const validateUrl = (url: string) => {
    const withSingleHyphens = url.toLowerCase().replace(/--+/g, "-");
    const rep = withSingleHyphens.replace(/[^a-z0-9-]/g, "");

    if (rep.startsWith("-")) {
      return rep.slice(1);
    }

    return rep;
  };

  return (
    <div className="p-10 bg-black-bg h-screen">
      <div className="flex items-center justify-between">
        <p className="text-xs">
          Logged in as: <br />
          <span className="font-bold">{user?.email}</span>
        </p>
        <Button
          variant="ghost"
          className="hover:text-red-500 hover:bg-red-500/10"
        >
          Logout
        </Button>
      </div>
      <Card className="flex flex-col gap-4 items-center mt-10 max-w-lg mx-auto">
        <img src="/logo/icon.png" alt="logo" className="w-10" />
        <h1 className="text-2xl mt-5">Let's hit the ground running</h1>
        <p className="text-muted-foreground -mt-2">
          We'll get you set up with your first workspace and project.
        </p>
        <div className="flex flex-col gap-6 w-full mt-5">
          <div className="">
            <p className="text-sm">Workspace Name</p>
            <Input
              placeholder="My Workspace"
              className="mt-2"
              value={workspaceName}
              onChange={(e) => {
                setWorkspaceName(e.target.value);
                if (!isUrlManuallyEdited) {
                  setSuggestedWorkspaceUrl(validateUrl(e.target.value));
                }
              }}
            />
          </div>
          <div className="">
            <p className="text-sm">Workspace URL</p>
            <div className="flex items-center mt-2 border hover:bg-accent/5 border-gray-001 p-2 rounded-lg focus-within:border-accent bg-background">
              <p className="text-sm text-muted-foreground">{APP_DOMAIN}/</p>
              <input
                className="bg-transparent w-full outline-none text-sm"
                value={
                  isUrlManuallyEdited
                    ? workspaceUrl
                    : workspaceUrl || suggestedWorkspaceUrl
                }
                onChange={(e) => {
                  setIsUrlManuallyEdited(true);
                  setWorkspaceUrl(validateUrl(e.target.value));
                }}
              />
            </div>
          </div>
          <Button
            className="w-full"
            disabled={
              !workspaceName ||
              (!workspaceUrl && !suggestedWorkspaceUrl) ||
              (isUrlManuallyEdited && !workspaceUrl)
            }
            onClick={() => mutate()}
            isLoading={isPending}
          >
            Create Workspace
          </Button>
        </div>
        <Button variant="ghost" className="w-full">
          Join a workspace
        </Button>
      </Card>
    </div>
  );
}
