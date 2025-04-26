import { EllipsisVertical } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "~/components/interface/button";
import { Input } from "~/components/interface/input";
import { SecretInput } from "~/components/interface/secret-input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import api from "~/lib/api";
import { toast } from "sonner";
import { useParams } from "@tanstack/react-router";
import useEnvironmentStore from "~/stores/environment";
import useSecretsStore from "~/stores/secrets";
import { cn } from "~/lib/utils";
import { useSecrets } from "~/hooks/useSecrets";
import { useUnsavedChangesStore } from "~/stores/unsaved-changes";
import { countUnsavedChanges } from "~/utils/count-unsaved-changes";
import { useQueryClient } from "@tanstack/react-query";

interface SecretProps {
  secret: {
    id: string;
    key: string;
    value: string;
  };
}

const Secret = ({ secret }: SecretProps) => {
  const { projectSlug, workspaceSlug } = useParams({
    from: "/_authenticated/$workspaceSlug/_dashboard/projects/$projectSlug/",
  });

  const { environment } = useEnvironmentStore();
  const [hideValue, setHideValue] = useState(true);
  const [secretValue, setSecretValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const { revealedSecrets, setRevealedSecrets } = useSecretsStore();
  const queryClient = useQueryClient();

  const { secrets, setSecrets } = useSecretsStore();
  const { localSecrets, setLocalSecrets } = useSecrets(
    workspaceSlug,
    projectSlug
  );

  const thisSecret = secrets.find((s) => s?.id === secret.id);

  const fetchSecretValue = async () => {
    if (!!secretValue) {
      setHideValue(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.get(
        `/api/${workspaceSlug}/${projectSlug}/secrets/reveal?key=${secret.key}&environment=${environment}`
      );
      const revealedValue = response.data.value;
      setSecretValue(revealedValue);
      setHideValue(false);

      // When revealing, update with the original value from the API
      setSecrets(
        secrets.map((s) => {
          if (s?.id === secret.id) {
            return { ...s, value: revealedValue, originalValue: revealedValue };
          }
          return s;
        })
      );

      // Update revealed secrets with the original value
      const updatedRevealedSecret = {
        ...secret,
        value: revealedValue,
        originalValue: revealedValue,
      };

      setRevealedSecrets(
        revealedSecrets.find((s) => s?.id === secret.id)
          ? revealedSecrets.map((s) =>
              s.id === secret.id ? updatedRevealedSecret : s
            )
          : [...revealedSecrets, updatedRevealedSecret]
      );
    } catch (error) {
      console.error("Error fetching secret value:", error);
      toast.error("Failed to reveal secret value");
    } finally {
      setIsLoading(false);
    }
  };

  const updateSecretValue = (newValue: string) => {
    // Update the secrets store
    setSecrets(
      secrets.map((s) => {
        if (s?.id === secret.id) {
          return { ...s, value: newValue };
        }
        return s;
      })
    );

    // Update the localSecrets state
    setLocalSecrets(
      localSecrets.map((s) => {
        if (s?.id === secret.id) {
          return { ...s, value: newValue };
        }
        return s;
      })
    );
  };

  const { setUnsavedChanges } = useUnsavedChangesStore();

  useEffect(() => {
    setUnsavedChanges(countUnsavedChanges());
  }, [secrets, localSecrets, setUnsavedChanges]);

  const isValueChanged = thisSecret?.value !== thisSecret?.originalValue;
  const isKeyChanged = thisSecret?.key !== secret.key;

  const handleDeleteSecret = async () => {
    try {
      await api.delete(
        `/api/${workspaceSlug}/${projectSlug}/secrets/${secret.id}`
      );
      // Update local state
      setSecrets(secrets.filter((s) => s?.id !== secret.id));
      setLocalSecrets(localSecrets.filter((s) => s?.id !== secret.id));
      // Also clear the secret from revealedSecrets to completely remove it from the UI
      setRevealedSecrets(revealedSecrets.filter((s) => s?.id !== secret.id));
      // Reset the secretValue state to ensure it's completely removed from the UI
      setSecretValue("");
      setHideValue(true);
      // Mark as deleted to hide from UI
      setIsDeleted(true);

      toast.success("Secret deleted successfully");
      // Invalidate the query to refresh the data
      queryClient.invalidateQueries({
        queryKey: ["secrets", workspaceSlug, projectSlug, environment],
      });
    } catch (error) {
      console.error("Error deleting secret:", error);
      toast.error("Failed to delete secret");
    }
  };

  return isDeleted ? null : (
    <div
      key={secret.id}
      data-secret-id={secret.id}
      className="w-full flex items-center gap-4 secrets-list-item"
    >
      <div className="w-[30%]">
        <Input
          defaultValue={secret.key}
          onChange={(e) => {
            setSecrets(
              secrets.map((s) => {
                if (s?.id === secret.id) {
                  return { ...s, key: e.target.value, isRevealed: true };
                }
                return s;
              })
            );
            // Also update localSecrets when key changes
            setLocalSecrets(
              localSecrets.map((s) => {
                if (s?.id === secret.id) {
                  return { ...s, key: e.target.value };
                }
                return s;
              })
            );
          }}
          className={cn(
            isKeyChanged && "border-yellow-500 focus:border-yellow-500"
          )}
        />
      </div>
      <div className="w-[70%] flex items-center">
        <SecretInput
          hideValue={hideValue}
          onClick={fetchSecretValue}
          value={secretValue}
          id={secret.id}
          key={secret.key}
          disabled={isLoading}
          onHideValue={() => {
            setHideValue(!hideValue);
          }}
          onChange={(e) => {
            updateSecretValue(e.target.value);
          }}
          isChanged={isValueChanged}
        />
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost">
              <EllipsisVertical size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={handleDeleteSecret}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Secret;
