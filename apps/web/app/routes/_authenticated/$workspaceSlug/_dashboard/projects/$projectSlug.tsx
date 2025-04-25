import {
  createFileRoute,
  Link,
  Outlet,
  useParams,
  useRouter,
} from "@tanstack/react-router";
import { Button } from "~/components/interface/button";
import { Ellipsis } from "lucide-react";
import {
  FireMinimalistic,
  ServerSquareCloud,
  SidebarMinimalistic,
  UsersGroupTwoRounded,
} from "solar-icon-set";
import cn from "classnames";
import api from "~/lib/api";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute(
  "/_authenticated/$workspaceSlug/_dashboard/projects/$projectSlug"
)({
  component: RouteComponent,
});

const tabs = [
  {
    label: "Environments",
    href: "",
    icon: ServerSquareCloud,
  },
  {
    label: "Activities",
    href: "/activities",
    icon: FireMinimalistic,
  },
  {
    label: "Compare",
    href: "/compare",
    icon: SidebarMinimalistic,
  },
  {
    label: "People",
    href: "/people",
    icon: UsersGroupTwoRounded,
  },
];

function RouteComponent() {
  const { workspaceSlug, projectSlug } = useParams({
    from: "/_authenticated/$workspaceSlug/_dashboard/projects/$projectSlug",
  });

  const router = useRouter();

  const { data: projectData } = useQuery({
    queryKey: ["project", workspaceSlug, projectSlug],
    queryFn: () => api.get(`/api/${workspaceSlug}/${projectSlug}`),
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{projectData?.data?.name}</h1>
        <Button variant="outline">
          <Ellipsis size={20} className="text-accent" />
        </Button>
      </div>
      <div className="flex items-center gap-x-5 my-10 bg-white/10 rounded-md p-2">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            // @ts-ignore
            to={`/$workspaceSlug/projects/$projectSlug${tab.href}`}
            params={{
              workspaceSlug,
              projectSlug,
            }}
          >
            <div
              className={cn(
                "flex items-center py-1 px-3 gap-2 font-medium text-sm cursor-pointer hover:bg-white/10 transition-all duration-300 rounded-md",
                router.latestLocation.pathname ===
                  `/${workspaceSlug}/projects/${projectSlug}${tab.href}` &&
                  "text-accent bg-accent/10"
              )}
            >
              <tab.icon size={16} iconStyle="Bold" />
              <span>{tab.label}</span>
            </div>
          </Link>
        ))}
      </div>
      <Outlet />
    </div>
  );
}
