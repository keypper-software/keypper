import api from ".";

export interface Workspace {
  id: string;
  name: string;
}

export interface Secret {
  id: string;
  key: string;
  value: string;
}

export type getWorkspaceResponse = Workspace[];
export type getEnvResponse = {
  environments: Workspace[];
};

export type getSeretsResponse = {
  secrets: Secret[];
  count: number;
};

export const getWorkspaces = () => {
  return api.get<getWorkspaceResponse>("/cli/workspaces");
};

export const getWorkspaceProjects = ({
  workspaceId,
}: {
  workspaceId: string;
}) => {
  return api.get<getWorkspaceResponse>(
    `/cli/workspaces/${workspaceId}/projects`
  );
};

export const getEnvs = ({
  workspaceId,
  projectId,
}: {
  workspaceId: string;
  projectId: string;
}) => {
  return api.get<getEnvResponse>(
    `/cli/workspaces/${workspaceId}/projects/${projectId}/envs`
  );
};

export const getSecrets = ({
  workspaceId,
  projectId,
  environmentId,
}: {
  workspaceId: string;
  projectId: string;
  environmentId: string;
}) => {
  return api.get<getSeretsResponse>(
    `/cli/workspaces/${workspaceId}/projects/${projectId}/secrets?env_id=${environmentId}`
  );
};
