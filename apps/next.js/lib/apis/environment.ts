import api from "../api";
import { Workspace } from "./workspace";

export interface Environment extends Workspace {}

export const getEnvironmentsFn = ({
  workspaceSlug,
  projectSlug,
}: {
  workspaceSlug: string;
  projectSlug: string;
}) => {
  return api.get<{ environments: Environment[] }>(
    `/${workspaceSlug}/${projectSlug}`
  );
};
