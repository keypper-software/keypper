import { createFileRoute } from "@tanstack/react-router";
import { Button } from "~/components/interface/button";
import { SiGoogle } from "react-icons/si";
import ContinueWithGitHub from "~/components/auth/ContinueWithGitHub";
import { APP_NAME } from "~/lib/constants";

export const Route = createFileRoute("/auth")({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: `Sign in to ${APP_NAME}`,
      },
    ],
  }),
});

function RouteComponent() {
  return (
    <div className="h-screen w-full bg-background flex flex-col items-center justify-center">
      <h3 className="text-foreground text-3xl font-medium">
        Welcome to {APP_NAME}
      </h3>
      <div className="mt-7 space-y-5 flex flex-col">
        <ContinueWithGitHub />
        <Button className="flex items-start gap-x-2 px-10 py-3 text-base bg-black text-foreground">
          <SiGoogle size={20} /> Continue with Google
        </Button>
      </div>
    </div>
  );
}
