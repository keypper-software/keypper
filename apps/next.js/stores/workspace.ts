import { create } from "zustand";

interface WorkspaceState {
  currentWorkspace: {
    id: string;
    slug: string;
    name: string;
  } | null;

  workspaces: {
    id: string;
    slug: string;
    name: string;
  }[];

  setCurrentWorkspace: (
    workspace: { id: string; slug: string; name: string } | null
  ) => void;
  setWorkspaces: (
    workspaces: { id: string; slug: string; name: string }[]
  ) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  currentWorkspace: null,
  workspaces: [],
  setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),
  setWorkspaces: (workspaces) => set({ workspaces }),
}));
