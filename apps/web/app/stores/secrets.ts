import { create } from "zustand";
import { Secret } from "~/hooks/useSecrets";

interface RevealedSecret {
  id: string;
  value: string;
  key: string;
}

interface SecretsStore {
  secrets: Secret[];
  setSecrets: (secrets: Secret[]) => void;
  revealedSecrets: RevealedSecret[];
  setRevealedSecrets: (secrets: RevealedSecret[]) => void;
}

const useSecretsStore = create<SecretsStore>((set) => ({
  secrets: [],
  setSecrets: (secrets) => set({ secrets }),
  revealedSecrets: [],
  setRevealedSecrets: (secrets) => set({ revealedSecrets: secrets }),
}));

export default useSecretsStore;
