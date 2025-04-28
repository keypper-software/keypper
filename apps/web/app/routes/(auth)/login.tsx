import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { SiGoogle } from "react-icons/si";
import ContinueWithGitHub from "~/components/auth/ContinueWithGitHub";
import { Button } from "~/components/interface/button";
import { APP_NAME } from "~/lib/constants";
export const Route = createFileRoute("/(auth)/login")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    if (context.userId) {
      return redirect({
        to: "/$workspaceSlug",
        params: { workspaceSlug: context.organization?.slug! },
      });
    }
  },
});

function RouteComponent() {
  return (
    <div className="h-screen w-full max-w-2xl mx-auto bg-background flex flex-col items-start justify-center space-y-5 relative px-10">
      <Link to="/">
        <img src="/logo/icon.png" alt="Keypper" className="w-[60px]" />
      </Link>
      <div className="absolute -top-[900px] right-0 w-[1000px] h-[1000px] bg-accent/50 blur-3xl rounded-full"></div>
      <h3 className="text-foreground text-3xl font-medium">
        Login to {APP_NAME}
      </h3>
      <p className="text-muted-foreground">
        Welcome back! Please sign in to continue.
      </p>
      <div className="space-x-5 flex">
        <ContinueWithGitHub />
        <Button className="flex items-start gap-x-2 px-10 py-3 text-base bg-black text-foreground">
          <SiGoogle size={20} /> Continue with Google
        </Button>
      </div>
    </div>
  );
}
