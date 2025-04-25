import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "~/lib/api";
import { toast } from "sonner";
import useEnvironmentStore from "~/stores/environment";
import useSecretsStore from "~/stores/secrets";
// Define the secret type
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
  const [selectedEnvironment, setSelectedEnvironment] = useState("");
  const [isRevealed, setIsRevealed] = useState(false);
  const [localSecrets, setLocalSecrets] = useState<Secret[]>([]);
  const [revealLoading, setRevealLoading] = useState(false);
  const [originalSecretValues, setOriginalSecretValues] = useState<
    Record<string, string>
  >({});
  const [hasChanges, setHasChanges] = useState(false);
  const [savingChanges, setSavingChanges] = useState(false);
  const [code, setCode] = useState("");

  const { data: environmentsData, isLoading: environmentsLoading } = useQuery({
    queryKey: ["environments", workspaceSlug, projectSlug],
    queryFn: async () => {
      const response = await api.get(`/api/${workspaceSlug}/${projectSlug}`);
      return response.data;
    },
  });

  // Fetch secrets using React Query
  const { data: secretsData, isLoading: secretsLoading } = useQuery({
    queryKey: ["secrets", workspaceSlug, projectSlug, selectedEnvironment],
    queryFn: async () => {
      if (!selectedEnvironment) return { secrets: [] };

      try {
        const response = await api.get(
          `/api/${workspaceSlug}/${projectSlug}/secrets?environment=${selectedEnvironment}`
        );
        useSecretsStore.setState({
          secrets: response.data.secrets,
        });
        return response.data;
      } catch (error) {
        console.error("Error fetching secrets:", error);
        toast.error("Failed to load secrets");
        return { secrets: [] };
      }
    },
  });

  // Update local secrets when API data changes
  useEffect(() => {
    if (secretsData?.secrets) {
      setLocalSecrets(secretsData.secrets);

      // Store the original secret values
      const originalValues: Record<string, string> = {};
      secretsData.secrets.forEach((secret) => {
        originalValues[secret.key] = secret.value;
      });
      setOriginalSecretValues(originalValues);
    }
  }, [secretsData]);

  const secrets = localSecrets;

  const { setEnvironment } = useEnvironmentStore();

  useEffect(() => {
    setSelectedEnvironment(environmentsData?.environments[0].name);
    setEnvironment(environmentsData?.environments[0].name);
  }, [environmentsData]);

  const getObfuscatedValue = () => {
    // Use a fixed length of 14 stars for all obfuscated values
    return "*".repeat(14);
  };

  // Generate code based on current state
  const parsedCode = secrets
    .map(
      (secret) =>
        `${secret.key} = ${isRevealed ? secret.value : getObfuscatedValue()}`
    )
    .join("\n");

  // Update code when secrets or reveal state changes
  useEffect(() => {
    setCode(
      secrets
        .map(
          (secret) =>
            `${secret.key} = ${
              isRevealed ? secret.value : getObfuscatedValue()
            }`
        )
        .join("\n")
    );
    setHasChanges(false);
  }, [secrets, isRevealed]);

  // Check if code has been modified
  useEffect(() => {
    if (!isRevealed) return;

    const currentCode = secrets
      .map((secret) => `${secret.key} = ${secret.value}`)
      .join("\n");

    setHasChanges(code !== currentCode);
  }, [code, secrets, isRevealed]);

  const handleReveal = async () => {
    setRevealLoading(true);

    try {
      // Fetch revealed secrets from API
      const response = await api.get(
        `/api/${workspaceSlug}/${projectSlug}/secrets?environment=${selectedEnvironment}&reveal=true`
      );

      if (response.data.secrets) {
        // Update local secrets with revealed values
        setLocalSecrets(response.data.secrets);

        // Store the original secret values
        const originalValues: Record<string, string> = {};
        response.data.secrets.forEach((secret) => {
          originalValues[secret.key] = secret.value;
        });
        setOriginalSecretValues(originalValues);

        setIsRevealed(true);
      }
    } catch (error) {
      console.error("Error revealing secrets:", error);
      toast.error("Failed to reveal secrets");
    } finally {
      setRevealLoading(false);
    }
  };

  const handleHide = () => {
    setRevealLoading(true);

    // Just update the local state without making an API call
    setIsRevealed(false);
    setRevealLoading(false);
  };

  // Parse the edited code and update secrets
  const parseEditedCode = () => {
    if (!code.trim()) return [];

    const lines = code.split("\n").filter((line) => line.trim());
    return lines.map((line) => {
      const [key, ...valueParts] = line.split("=").map((part) => part.trim());
      const value = valueParts.join("=").trim();

      // Find the existing secret to preserve its ID and other properties
      const existingSecret = secrets.find((s) => s.key === key);

      // If we have an existing secret, use it as a base and update the value
      if (existingSecret) {
        return {
          ...existingSecret,
          value,
        };
      }

      // For new secrets, create a minimal object with required properties
      // The server will generate the rest of the properties
      return {
        id: `new-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        key,
        value,
        version: "1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isRevealed: false,
      };
    });
  };

  // Save changes to the API
  const handleSaveChanges = async () => {
    if (!isRevealed || !hasChanges) return;

    setSavingChanges(true);

    try {
      const updatedSecrets = parseEditedCode();

      // Make API request to update secrets
      await api.post(
        `/api/${workspaceSlug}/${projectSlug}/secrets?environment=${selectedEnvironment}`,
        { secrets: updatedSecrets }
      );

      // Update local state
      setLocalSecrets(updatedSecrets);

      // Update original values
      const newOriginalValues: Record<string, string> = {};
      updatedSecrets.forEach((secret) => {
        newOriginalValues[secret.key] = secret.value;
      });
      setOriginalSecretValues(newOriginalValues);

      setHasChanges(false);
      toast.success("Secrets updated successfully");
    } catch (error) {
      console.error("Error saving secrets:", error);
      toast.error("Failed to save secrets");
    } finally {
      setSavingChanges(false);
    }
  };

  return {
    selectedEnvironment,
    setSelectedEnvironment,
    isRevealed,
    localSecrets,
    setLocalSecrets,
    revealLoading,
    hasChanges,
    savingChanges,
    code,
    setCode,
    environmentsData,
    environmentsLoading,
    secretsData,
    secretsLoading,
    handleReveal,
    handleHide,
    handleSaveChanges,
  };
}
