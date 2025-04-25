import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { auth } from "~/lib/auth";

export const Route = createFileRoute("/_authenticated")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    console.log("context", context);
    if (!context.userId) {
      return redirect({ to: "/login" });
    }
  },
});

function RouteComponent() {
  return <Outlet />;
}
