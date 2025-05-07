import { create } from "zustand";

interface EnvironmentStore {
  environment: string;
  environmentsLoading: boolean;
  setEnvironment: (environment: string) => void;
  setEnvironmentLoading: (state: boolean) => void;
}

const useEnvironmentStore = create<EnvironmentStore>((set) => ({
  environment: "",
  environmentsLoading: false,
  setEnvironment: (environment) => set({ environment }),
  setEnvironmentLoading: (state) => set({ environmentsLoading: state }),
}));

export default useEnvironmentStore;
