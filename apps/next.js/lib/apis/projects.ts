import api from "../api";
import { Workspace } from "./workspace";

export interface Project extends Workspace {
  description: string;
  lastUpdated: string;
}

export const getProjectsFn = ({ workspaceSlug }: { workspaceSlug: string }) => {
  return api.get<Project[]>(`/${workspaceSlug}/projects`);
};
