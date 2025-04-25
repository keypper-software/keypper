import { create } from "zustand";

interface WorkspaceState {
  currentWorkspace: {
    id: string;
    slug: string;
  } | null;

  setCurrentWorkspace: (workspace: { id: string; slug: string } | null) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  currentWorkspace: {
    id: "b503a479-7074-4d2b-8417-db26863e9b5d",
    slug: "bllow",
  },
  setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),
}));
