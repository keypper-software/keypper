import { create } from "zustand";

type Project = {
  id: string;
  // Add other project properties here
};

type ProjectState = {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProjects: () => Promise<void>;
  setCurrentProject: (project: Project) => void;
  clearCurrentProject: () => void;
  getProjectById: (id: string) => Project | undefined;
};

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true });
    try {
      // TODO: Implement API call to fetch projects
      set({ projects: [], error: null });
    } catch (err) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  setCurrentProject: (project) => {
    set({ currentProject: project });
  },

  clearCurrentProject: () => {
    set({ currentProject: { id: "bllow-web-app" } });
  },

  getProjectById: (id) => {
    return get().projects.find((project) => project.id === id);
  },
}));
