"use client";
import { Button } from "@/components/interface/button";
import DashboardSkeleton from "@/components/interface/skeletons/dashboard-skeleton";
import { getWorkspacesFn, Workspace } from "@/lib/apis/workspace";
import { useQuery } from "@tanstack/react-query";
import { AxiosError, isAxiosError } from "axios";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { PacmanLoader } from "react-spinners";

interface userContextI {
  loading: boolean;
  workspaces: Workspace[];
  currentWorkspace: Workspace;
  error?: unknown;
  success?: boolean;
  projectSlug?: string;
  workspaceSlug?: string;
}

export const userContext = createContext<userContextI>(null!);
const IGNORE_PATHS = ["/login", "/", "/signup", "/onboarding"];

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { workspaceSlug, projectSlug } = useParams();

  const isIgnored = IGNORE_PATHS.includes(pathname);

  const workspaces = useQuery({
    queryKey: ["workspaces"],
    queryFn: getWorkspacesFn,
    refetchOnWindowFocus: false,
    // staleTime: Infinity,
    // gcTime: 1000 * 60 * 60,
    // retry: 1,
  });

  const allWorkspaces = workspaces?.data?.data || [];

  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace>(
    allWorkspaces?.[0] || {
      id: Math.random().toString(36),
      slug: workspaceSlug,
      name: workspaceSlug,
    }
  );

  useEffect(() => {
    if (!isAxiosError(workspaces.error)) return;
    if (workspaces.error.response?.status == 401) {
      router.replace(`/login?continue=${pathname}`);
    }

    const matchingWorkspace = allWorkspaces?.find(
      (workspace) =>
        workspace.slug.toLowerCase() ===
        String(workspaceSlug || "").toLowerCase()
    );

    if (allWorkspaces?.length > 0) {
      if (!!matchingWorkspace) {
        return setCurrentWorkspace(matchingWorkspace);
      }
      return setCurrentWorkspace(allWorkspaces[0]);
    }
    setCurrentWorkspace({
      id: Math.random().toString(36),
      slug: "/onboarding",
      name: "onboarding",
    });
  }, [workspaces.data, allWorkspaces, workspaceSlug, pathname]);

  if (!isIgnored && workspaces.isLoading) {
    return (
      <div className="">
        <div className="absolute top-0 left-0 w-full p-6 flex">
          <img src="/logo/wordmark.png" alt="Keypper" className="w-[120px]" />
        </div>
        <div className="w-screen bg-gradient-to-br from-gray-900 to-black h-screen flex justify-center items-center">
          <PacmanLoader color="#0edbbd" size={20} />
        </div>
      </div>
    );
  }

  const isWorkspaceNotFound = () => {
    if (!isIgnored && allWorkspaces && allWorkspaces.length === 0) {
      return true;
    }

    if (
      !isIgnored &&
      allWorkspaces &&
      allWorkspaces.length > 0 &&
      workspaceSlug
    ) {
      return !allWorkspaces.some(
        (workspace) =>
          workspace.slug.toLowerCase() ===
          String(workspaceSlug || "").toLowerCase()
      );
    }

    return false;
  };

  if (isWorkspaceNotFound()) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white p-4">
        <div className="bg-gray-800/70 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-gray-700/50 max-w-md w-full">
          <div className="flex justify-center mb-6">
            <img src="/logo/icon.png" alt="Keypper" className="w-16 h-16" />
          </div>

          <h2 className="text-2xl font-bold mb-2 text-center text-accent">
            Workspace Not Found
          </h2>

          <div className="bg-red-500/10 border my-3 border-red-500/20 rounded-lg p-4 mb-6">
            <p className="text-sm text-center text-gray-300">
              {allWorkspaces && allWorkspaces.length === 0
                ? "You don't have access to any workspaces yet."
                : "The workspace you're looking for doesn't exist or you don't have access to it."}
            </p>
          </div>

          <div className="space-y-4">
            {allWorkspaces && allWorkspaces.length > 0 ? (
              <>
                <p className="text-sm text-gray-400 text-center mb-2">
                  Available workspaces:
                </p>
                <div className="grid gap-2">
                  {allWorkspaces.slice(0, 3).map((workspace: Workspace) => (
                    <Button
                      key={workspace.slug}
                      className="w-full py-3 flex items-center justify-center gap-2 bg-gray-700/50 text-white hover:text-black hover:bg-accent/80 transition-all duration-300"
                      onClick={() =>
                        window.location.assign(`/${workspace.slug}`)
                      }
                    >
                      {workspace.name || workspace.slug}
                    </Button>
                  ))}

                  {allWorkspaces.length > 3 && (
                    <Button
                      variant="outline"
                      className="w-full py-2 text-sm border-gray-600 hover:bg-gray-700/50"
                      // onClick={() => router.push("/workspaces")}
                    >
                      View all workspaces ({allWorkspaces.length})
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <Button
                className="w-full py-3 bg-accent hover:bg-accent/80 transition-all duration-300"
                onClick={() => router.push("/onboarding")}
              >
                Get Started
              </Button>
            )}

            <p className="text-xs text-gray-500 text-center mt-4">
              Need help? Contact our support team.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <userContext.Provider
      value={{
        loading: workspaces.isLoading,
        error: workspaces.error,
        success: workspaces.isSuccess,
        workspaces: allWorkspaces,
        currentWorkspace: currentWorkspace,
        projectSlug: projectSlug as string,
        workspaceSlug: workspaceSlug as string,
      }}
    >
      {children}
    </userContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(userContext);
  if (!ctx) console.warn("[hooks]", "User context  not in scope");
  return ctx;
};
