import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import api from "~/lib/api";
import useEnvironmentStore from "~/stores/environment";

export default ({ workspaceSlug, projectSlug }) => {
  const { setEnvironment, setEnvironmentLoading } = useEnvironmentStore();

  const { data: environmentsData, isLoading: environmentsLoading } = useQuery({
    queryKey: ["environments", workspaceSlug, projectSlug],
    queryFn: async () => {
      const response = await api.get(`/api/${workspaceSlug}/${projectSlug}`);
      return response.data;
    },
  });

  useEffect(() => {
    if (!setEnvironmentLoading && environmentsData?.environments) {
      setEnvironment(environmentsData?.environments[0].name);
    }
    setEnvironmentLoading(environmentsLoading);
  }, [environmentsData, setEnvironmentLoading]);

  return {
    loading: environmentsLoading,
    environments: environmentsData,
    initialEnv: environmentsData?.environments[0].name,
  };
};
