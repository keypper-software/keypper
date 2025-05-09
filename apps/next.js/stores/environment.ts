import { Environment } from "@/lib/apis/environment";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface EnvironmentStore {
  environment: string;
  environmentsLoading: boolean;
  environments: Environment[];
  setEnvironment: (environment: string) => void;
  setEnvironmentLoading: (state: boolean) => void;
  setEnvironments: (environments: Environment[]) => void;
}

const useEnvironmentStore = create<EnvironmentStore>()((set) => ({
  environment: "",
  environmentsLoading: false,
  environments: [],
  setEnvironments: (environments) => set({ environments }),
  setEnvironment: (environment) => set({ environment }),
  setEnvironmentLoading: (state) => set({ environmentsLoading: state }),
}));

export default useEnvironmentStore;
