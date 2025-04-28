import { create } from "zustand";
import { Secret } from "~/hooks/useSecrets";

export interface RevealedSecret {
  id: string;
  value: string;
  env?:string;
  originalValue?: string;
  newValue?: string;
  newKey?: string;
  key: string;
}

interface SecretsStore {
  secrets: RevealedSecret[];
  setSecrets: (secrets: RevealedSecret[]) => void;
  // revealedSecrets: RevealedSecret[];
  // setRevealedSecrets: (secrets: RevealedSecret[]) => void;
}

const useSecretsStore = create<SecretsStore>((set) => ({
  secrets: [],
  setSecrets: (secrets) => set({ secrets }),
  // revealedSecrets: [],
  // setRevealedSecrets: (secrets) => set({ revealedSecrets: secrets }),
}));

export default useSecretsStore;
