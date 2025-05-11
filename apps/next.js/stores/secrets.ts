import { create } from "zustand";
import { Secret } from "@/hooks/useSecrets";

export interface RevealedSecret {
  id: string;
  value: string;
  env?: string;
  originalValue?: string;
  newValue?: string;
  newKey?: string;
  deleted?: boolean;
  key: string;
}

interface SecretsStore {
  secrets: RevealedSecret[];
  setSecrets: (secrets: RevealedSecret[]) => void;
}

const useSecretsStore = create<SecretsStore>((set) => ({
  secrets: [],
  setSecrets: (secrets) => set({ secrets }),
}));

export default useSecretsStore;
