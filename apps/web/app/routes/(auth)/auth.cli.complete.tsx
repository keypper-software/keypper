import { createFileRoute } from "@tanstack/react-router";
import { Button } from "~/components/interface/button";
import Card from "~/components/interface/card";
import { APP_NAME } from "~/lib/constants";

export const Route = createFileRoute("/(auth)/auth/cli/complete")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="p-10 flex items-center flex-col">
      <img src="/logo/wordmark.png" alt="logo" className="w-48" />
      <h1 className="text-5xl font-medium text-center mt-10">
        CLI Authentication Completed
      </h1>
      <Card className="mt-10 max-w-screen-sm w-full">
        <p className="text-sm text-gray-500">
          The {APP_NAME} CLI is now logged in.
        </p>
        <Button className="w-full mt-4">Manage tokens</Button>
      </Card>

      <p></p>
    </div>
  );
}
