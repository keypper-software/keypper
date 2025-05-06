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

  const filteredSecrets = secrets.filter(
    (secret) => secret.env === environment
  );

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

      const data = response.data.secrets as Secret[];
      const previousSecrets = secrets;
      const secretMaps = new Map();

      previousSecrets.forEach((secret) => {
        secretMaps.set(secret.id, secret);
      });

      data.forEach((secret) => {
        if (!secretMaps.has(secret.id)) {
          secretMaps.set(secret.id, { ...secret, env: environment });
        }
      });

      const updatedSecrets = Array.from(secretMaps.values());
      setSecrets(updatedSecrets);

      return response.data;
    },
    onError() {
      toast.error("Failed to load secrets");
    },
  });

  const parseEditedCode = () => {
    const changes = filteredSecrets
      .filter((secret) => {
        return secret.deleted || secret.newKey || secret.newValue;
      })
      .map((secret) => {
        return {
          id: secret.id,
          environment: secret.env,
          key: secret.newKey,
          shouldDelete: secret.deleted || false,
          value: secret.newValue,
        };
      });
    return changes;
  };

  // const handleSaveChanges = useMutation({
  //   mutationFn: async () => {
  //     if (!getChangesCount()) return;
  //     try {
  //       const updatedSecrets = parseEditedCode();
  //       await api.post(
  //         `/api/${workspaceSlug}/${projectSlug}/secrets?environment=${environment}`,
  //         { secrets: updatedSecrets }
  //       );
  //       toast.success("Secrets updated successfully");
  //     } catch (error) {
  //       toast.error("Failed to save secrets");
  //     } finally {
  //     }
  //   },
  // });

  const getChangesCount = () => {
    return filteredSecrets.reduce((count, secret) => {
      let changeCount = 0;

      if (
        (secret.newKey !== undefined && secret.newKey !== secret.key) ||
        secret.deleted || (secret.newValue !== undefined && secret.newValue !== secret.originalValue)
      ) {
        changeCount++;
      }

      // if (
      //   secret.newValue !== undefined &&
      //   secret.newValue !== secret.originalValue
      // ) {
      //   changeCount++;
      // }

      return count + changeCount;
    }, 0);
  };

  const getOriginalValue = async (key: string, id: string) => {
    try {
      const response = await api.get(
        `/api/${workspaceSlug}/${projectSlug}/secrets/reveal?key=${key}&environment=${environment}`
      );
      const revealedValue = response.data.value;
      const newSecret = secrets.map((secret) => {
        if (secret.key == key && secret.id == id && secret.env == environment) {
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

  const handleDeleteSecret = async (id: string) => {
    const updatedSecrets = secrets.map((secret) => {
      if (secret.id == id) {
        return {
          ...secret,
          deleted: true,
        };
      }
      return secret;
    });
    setSecrets(updatedSecrets);
  };

  const removeDeleteSecret = async (id: string) => {
    const updatedSecrets = secrets.map((secret) => {
      if (secret.id == id) {
        return {
          ...secret,
          deleted: false,
        };
      }
      return secret;
    });
    setSecrets(updatedSecrets);
  };

  return {
    secrets: filteredSecrets,
    rawSecrets: secrets,
    secretsLoading,
    mutate,
    mutateAsync,
    getOriginalValue,
    getChangesCount,
    updating: false,
    saveChanges: parseEditedCode,
    handleDeleteSecret,
    undoDeleteSecret: removeDeleteSecret,
    fetchSecrets: mutate,
  };
}
