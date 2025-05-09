"use client";
import { Button } from "@/components/interface/button";
import DashboardSkeleton from "@/components/interface/skeletons/dashboard-skeleton";
import { getWorkspacesFn, Workspace } from "@/lib/apis/workspace";
import { useQuery } from "@tanstack/react-query";
import { AxiosError, isAxiosError } from "axios";
import { usePathname, useRouter } from "next/navigation";
import { createContext, ReactNode, useContext, useEffect } from "react";

interface userContextI {
  loading: boolean;
  workspaces: Workspace[];
  currentWorkspace: Workspace;
  error?: unknown;
  success?: boolean;
  projectSlug?: string;
}

export const userContext = createContext<userContextI>(null!);
const IGNORE_PATHS = ["/login", "/", "/signup"];

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const $workspaceSlug = pathname.split("/")?.[1]?.toLowerCase();
  const $projectSlug = pathname.split("/")?.[3]?.toLowerCase();
  const isIgnored = IGNORE_PATHS.includes(pathname);
  const workspaces = useQuery({
    queryKey: ["workspaces"],
    queryFn: getWorkspacesFn,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60,
    retry: 1,
  });

  const allWorkspaces = workspaces?.data?.data || [];

  useEffect(() => {
    if (!isAxiosError(workspaces.error)) return;
    if (workspaces.error.response?.status == 401) {
      router.replace(`/login?continue=${pathname}`);
    }
  }, [workspaces.isLoading]);

  if (!isIgnored && workspaces.isLoading) {
    return <DashboardSkeleton />;
  }

  if (
    !isIgnored &&
    allWorkspaces.some(
      (workspace) => workspace.slug.toLowerCase() != $workspaceSlug
    )
  ) {
    return (
      <div className="flex h-screen items-center justify-center text-white">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Workspace Not Found</h2>
          <p className="mb-4">Are you sure you are in the right workspace?</p>
          <Button
            className="px-4 cursor-pointer py-2 rounded-md"
            onClick={() => router.push(`/${allWorkspaces[0].slug}`)}
          >
            Go to Default Workspace
          </Button>
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
        currentWorkspace: allWorkspaces[0],
        projectSlug: $projectSlug,
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
