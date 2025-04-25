import { create } from "zustand";

interface EnvironmentStore {
  environment: string;
  setEnvironment: (environment: string) => void;
}

const useEnvironmentStore = create<EnvironmentStore>((set) => ({
  environment: "",
  setEnvironment: (environment) => set({ environment }),
}));

export default useEnvironmentStore;
