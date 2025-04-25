import { createFileRoute, Outlet } from "@tanstack/react-router";
import Sidebar from "~/components/workspace/sidebar";

export const Route = createFileRoute(
  "/_authenticated/$workspaceSlug/_dashboard"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-screen bg-black-bg text-white">
      <Sidebar />
      <div className="p-5 flex-1 h-full">
        <div className="py-5 px-10 bg-[#121214] rounded-2xl border border-border-muted w-full h-full overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
