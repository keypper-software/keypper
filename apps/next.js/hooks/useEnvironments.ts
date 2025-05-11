"use client";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { getEnvironmentsFn } from "@/lib/apis/environment";
import useEnvironmentStore from "@/stores/environment";

export default function useEnvironment({
  workspaceSlug,
  projectSlug,
}: {
  workspaceSlug: string;
  projectSlug: string;
}) {
  const {
    environment,
    environments,
    setEnvironment,
    setEnvironmentLoading,
    setEnvironments,
  } = useEnvironmentStore();

  const {
    data: environmentsData,
    isLoading: environmentsLoading,
    isError,
  } = useQuery({
    queryKey: ["environments", workspaceSlug, projectSlug],
    queryFn: () => getEnvironmentsFn({ projectSlug, workspaceSlug }),
    staleTime: 5 * 60 * 1000,
    enabled: !!workspaceSlug && !!projectSlug,
  });

  const allEnvs = environmentsData?.data?.environments || [];
  useEffect(() => {
    if (allEnvs.length > 0 && !isError) {
      setEnvironments(allEnvs);
      setEnvironment(allEnvs[0].name);
    }
  }, [environmentsLoading, allEnvs]);
  return {
    loading: environmentsLoading,
    environments: allEnvs || [],
    isError,
    currentEnvironment: environment,
  };
}
