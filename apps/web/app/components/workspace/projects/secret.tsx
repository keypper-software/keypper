import { EllipsisVertical } from "lucide-react";
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
import useSecretsStore, { RevealedSecret } from "~/stores/secrets";
import { useSecrets } from "~/hooks/useSecrets";
import { useState } from "react";
import { cn } from "~/lib/utils";
import { useUnsavedChangesStore } from "~/stores/unsaved-changes";
import { countUnsavedChanges } from "~/utils/count-unsaved-changes";
import { useQueryClient } from "@tanstack/react-query";

interface SecretProps {
  secret: RevealedSecret;
}

const Secret = ({ secret }: SecretProps) => {
  const { projectSlug, workspaceSlug } = useParams({
    from: "/_authenticated/$workspaceSlug/_dashboard/projects/$projectSlug/",
  });

  const [loading, setLoading] = useState(false);
  const [hideValue, setHideValue] = useState(true);
  const { secrets, getOriginalValue, rawSecrets } = useSecrets(
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
  const { setSecrets } = useSecretsStore();

  const fetchSecret = async () => {
    setHideValue(false);
    setLoading(true);
    try {
      await getOriginalValue(secret.key, secret.id);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const updateSecret = (type: "key" | "value", value: string) => {
    let updated;
    if (type === "key") {
      updated = rawSecrets.map((s) => {
        if (secret.id == s.id) {
          return {
            ...s,
            newKey: value,
          };
        }
        return s;
      });
    } else {
      updated = rawSecrets.map((s) => {
        if (secret.id == s.id) {
          return {
            ...s,
            newValue: value,
          };
        }
        return s;
      });
    }
    setSecrets(updated);
  };


  const isKeyChanged = !secret.newKey ? false : secret.newKey !== secret.key;
  const isValueChanged =
    !secret.originalValue || !secret.newValue
      ? false
      : secret.newValue !== secret.originalValue;
  return (

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

          defaultValue={isKeyChanged ? secret.newKey : secret.key}
          onChange={(e) => updateSecret("key", e.target.value)}

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
          onClick={fetchSecret}
          value={isValueChanged ? secret.newValue : secret.originalValue}
          id={secret.id}
          key={secret.key}
          // disabled={loading}
          onHideValue={() => {
            setHideValue(true);
          }}

          onChange={(e) => updateSecret("value", e.target.value)}

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
