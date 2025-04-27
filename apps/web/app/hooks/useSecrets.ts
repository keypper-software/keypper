import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "~/lib/api";
import { toast } from "sonner";
import useEnvironmentStore from "~/stores/environment";
import useSecretsStore, { RevealedSecret } from "~/stores/secrets";

export interface Secret {
  id: string;
  key: string;
  value: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  originalValue?: string;
}

export function useSecrets(workspaceSlug: string, projectSlug: string) {
  const { environment } = useEnvironmentStore();
  const { secrets, setSecrets } = useSecretsStore();

  // Fetch secrets using React Query
  const { isPending: secretsLoading, mutate, mutateAsync } = useMutation({
    mutationKey: ["secrets", workspaceSlug, projectSlug, environment],

    mutationFn: async () => {
      if (!environment) return { secrets: [] };
      const response = await api.get(
        `/api/${workspaceSlug}/${projectSlug}/secrets?environment=${environment}`
      );
      setSecrets(response.data.secrets);
      return response.data;
    },
    onError() {
      toast.error("Failed to load secrets");
    },
  });

  // Save changes to the API
  // const handleSaveChanges = async () => {
  //   if (!isRevealed || !hasChanges) return;

  //   setSavingChanges(true);

  //   try {
  //     const updatedSecrets = parseEditedCode();

  //     // Make API request to update secrets
  //     await api.post(
  //       `/api/${workspaceSlug}/${projectSlug}/secrets?environment=${selectedEnvironment}`,
  //       { secrets: updatedSecrets }
  //     );

  //     // Update local state
  //     setLocalSecrets(updatedSecrets);

  //     // Update original values
  //     const newOriginalValues: Record<string, string> = {};
  //     updatedSecrets.forEach((secret) => {
  //       newOriginalValues[secret.key] = secret.value;
  //     });
  //     setOriginalSecretValues(newOriginalValues);

  //     setHasChanges(false);
  //     toast.success("Secrets updated successfully");
  //   } catch (error) {
  //     console.error("Error saving secrets:", error);
  //     toast.error("Failed to save secrets");
  //   } finally {
  //     setSavingChanges(false);
  //   }
  // };

  const getOriginalValue = async (key: string) => {
    try {
      const response = await api.get(
        `/api/${workspaceSlug}/${projectSlug}/secrets/reveal?key=${key}&environment=${environment}`
      );
      const revealedValue = response.data.value;
      const newSecret = secrets.map((secret) => {
        if (secret.key == key) {
          return {
            ...secret,
            originalValue: revealedValue,
          };
        }
        return secret;
      });

      setSecrets(newSecret);
      return revealedValue;
    } catch (err) {
      throw err;
    }
  };

  const getChangesCount = () => {
    return secrets.reduce((count, change) => {
      if (change.newKey !== undefined) count++;

      if (change.newValue !== undefined) count++;

      return count;
    }, 0);
  };

  return {
    secrets,
    secretsLoading,
    mutate,
    mutateAsync,
    getOriginalValue,
    getChangesCount,
  };
}
