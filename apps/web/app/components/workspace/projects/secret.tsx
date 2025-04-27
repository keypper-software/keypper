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

interface SecretProps {
  secret: RevealedSecret;
}

const Secret = ({ secret }: SecretProps) => {
  const { projectSlug, workspaceSlug } = useParams({
    from: "/_authenticated/$workspaceSlug/_dashboard/projects/$projectSlug/",
  });

  const [loading, setLoading] = useState(false);
  const [hideValue, setHideValue] = useState(true);
  const { secrets, getOriginalValue } = useSecrets(workspaceSlug, projectSlug);
  const { setSecrets } = useSecretsStore();

  const fetchSecret = async () => {
    setHideValue(false);
    setLoading(true);
    try {
      await getOriginalValue(secret.key);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const updateSecret = (type: "key" | "value", value: string) => {
    let updated;
    if (type === "key") {
      updated = secrets.map((s) => {
        if (secret.id == s.id) {
          return {
            ...s,
            newKey: value,
          };
        }
        return s;
      });
    } else {
      updated = secrets.map((s) => {
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
    <div
      key={secret.id}
      className="w-full flex items-center gap-4 secrets-list-item"
    >
      <div className="w-[30%]">
        <Input
          defaultValue={secret.key}
          onChange={(e) => updateSecret("key", e.target.value)}
          className={cn(
            isKeyChanged && "border-yellow-500 focus:border-yellow-500"
          )}
        />
      </div>
      <div className="w-[70%] flex items-center">
        <SecretInput
          hideValue={hideValue}
          onClick={fetchSecret}
          value={secret.originalValue}
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
            <DropdownMenuItem>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Secret;
