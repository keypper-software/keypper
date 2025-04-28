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

  const {
    isPending: secretsLoading,
    mutate,
    mutateAsync,
  } = useMutation({
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

  const parseEditedCode = () => {};

  const handleSaveChanges = useMutation({
    mutationFn: async () => {
      if (!getChangesCount()) return;
      try {
        const updatedSecrets = parseEditedCode();
        await api.post(
          `/api/${workspaceSlug}/${projectSlug}/secrets?environment=${environment}`,
          { secrets: updatedSecrets }
        );
        toast.success("Secrets updated successfully");
      } catch (error) {
        toast.error("Failed to save secrets");
      } finally {
      }
    },
  });

  const getChangesCount = () => {
    return secrets.reduce((count, secret) => {
      let changeCount = 0;

      if (secret.newKey !== undefined && secret.newKey !== secret.key) {
        changeCount++;
      }

      if (
        secret.newValue !== undefined &&
        secret.newValue !== secret.originalValue
      ) {
        changeCount++;
      }

      return count + changeCount;
    }, 0);
  };
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

  return {
    secrets,
    secretsLoading,
    mutate,
    mutateAsync,
    getOriginalValue,
    getChangesCount,
    updating: handleSaveChanges.isPending,
    saveChanges: handleSaveChanges.mutateAsync,
  };
}
