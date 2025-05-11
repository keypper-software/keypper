import api from "../api";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
}

export const getWorkspacesFn = () => {
  return api.get<Workspace[]>("/workspaces");
};
