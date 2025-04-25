import { create } from "zustand";

interface UnsavedChangesStore {
  unsavedChanges: number;
  setUnsavedChanges: (unsavedChanges: number) => void;
}

export const useUnsavedChangesStore = create<UnsavedChangesStore>((set) => ({
  unsavedChanges: 0,
  setUnsavedChanges: (unsavedChanges: number) => set({ unsavedChanges }),
}));
