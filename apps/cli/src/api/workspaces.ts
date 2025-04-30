import api from ".";

export interface getWorkspaceResponse {}

export const getWorkspaces = () => {
  return api.post<getWorkspaceResponse>("/cli/workspaces");
};
