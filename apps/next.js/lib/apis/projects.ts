import api from "../api";
import { Workspace } from "./workspace";

export interface Project extends Workspace {
  description: string;
  lastUpdated: string;
}

export const getProjectsFn = ({ workspaceSlug }: { workspaceSlug: string }) => {
  return api.get<Project[]>(`/${workspaceSlug}/projects`);
};

interface createProjectParams {
  name: string;
  description?: string;
}

export const createProjectsFn = ({
  workspaceSlug,
  data,
}: {
  workspaceSlug: string;
  data: createProjectParams;
}) => {
  return api.post<Project>(`/${workspaceSlug}/projects`, data);
};
