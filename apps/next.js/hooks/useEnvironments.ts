"use client";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import api from "@/lib/api";
import useEnvironmentStore from "@/stores/environment";
import { getEnvironmentsFn } from "@/lib/apis/environment";

export default ({
  workspaceSlug,
  projectSlug,
}: {
  workspaceSlug: string;
  projectSlug: string;
}) => {
  const { setEnvironment, setEnvironmentLoading, setEnvironments } =
    useEnvironmentStore();

  const { data: environmentsData, isLoading: environmentsLoading } = useQuery({
    queryKey: ["environments", workspaceSlug, projectSlug],
    queryFn: () => getEnvironmentsFn({ projectSlug, workspaceSlug }),
  });

  useEffect(() => {
    if (!setEnvironmentLoading && environmentsData?.data.environments) {
      setEnvironment(environmentsData?.data.environments[0].name);
      setEnvironments(environmentsData?.data.environments);
    }
    setEnvironmentLoading(environmentsLoading);
  }, [environmentsData, setEnvironmentLoading]);

  return {
    loading: environmentsLoading,
    environments: environmentsData?.data.environments,
    initialEnv: environmentsData?.data.environments[0].name,
  };
};
