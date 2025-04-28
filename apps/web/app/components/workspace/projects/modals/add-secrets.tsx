import { useState, useRef } from "react";
import { Plus, Trash } from "lucide-react";
import { Button } from "~/components/interface/button";
import { Input } from "~/components/interface/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import api from "~/lib/api";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useSecrets } from "~/hooks/useSecrets";

interface Secret {
  index: number;
  key: string;
  value: string;
}

interface AddSecretsDialogProps {
  workspaceSlug: string;
  projectSlug: string;
  selectedEnvironment: string;
}

const initialSecret = [{ key: "", value: "", index: 0 }];
export default function AddSecretsDialog({
  workspaceSlug,
  projectSlug,
  selectedEnvironment,
}: AddSecretsDialogProps) {
  const { secretsLoading, mutateAsync } = useSecrets(
    workspaceSlug,
    projectSlug
  );
  const [newSecrets, setNewSecrets] = useState<Secret[]>(initialSecret);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const parseEnvContent = (content: string) => {
    const lines = content.split("\n").filter((line) => line.trim());
    const parsedSecrets = lines
      .map((line) => {
        const [key, ...valueParts] = line.split("=").map((part) => part.trim());
        const rawValue = valueParts.join("=").trim();
        const value = rawValue.replace(/^(['"])(.*)\1$/, "$2");
        if (!key.startsWith("#")) {
          return { key, value };
        }
      })
      .filter((v) => Boolean(v?.key));

    for (const allNewSecrets of parsedSecrets) {
      handleAddNew(allNewSecrets?.key, allNewSecrets?.value);
    }
    if (parsedSecrets.length > 0) {
      toast.success(`Parsed ${parsedSecrets.length} secrets from clipboard`);
    }
  };

  const handleKeyPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedContent = e.clipboardData.getData("text");
    if (!pastedContent) return;
    const isValidEnvContent = pastedContent.split("\n").some((line) => {
      return line.split("=").length > 1 && !line.startsWith("#");
    });
    if (!isValidEnvContent) return;
    parseEnvContent(pastedContent);
  };

  const handleSecretChange = (
    index: number,
    field: keyof Secret,
    value: string
  ) => {
    const updatedSecrets = newSecrets.map((secret) => {
      if (secret.index === index) {
        return {
          ...secret,
          [field]: value,
        };
      }

      return secret;
    });

    setNewSecrets(updatedSecrets);
  };

  const handleAddNew = (key?: string, value?: string) => {
    setNewSecrets((oldSecrets) => [
      ...oldSecrets,
      {
        index: oldSecrets.length + 1,
        key: key || "",
        value: value || "",
      },
    ]);
  };

  const resetState = () => {
    setNewSecrets(initialSecret);
  };

  // const handleFirstKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = e.target.value;
  //   if (newSecrets.length === 0) {
  //     setNewSecrets([{ key: value, value: "" }]);
  //   } else {
  //     handleSecretChange(0, "key", value);
  //   }
  // };

  // const handleFirstValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = e.target.value;
  //   if (newSecrets.length === 0) {
  //     setNewSecrets([{ key: "", value }]);
  //   } else {
  //     handleSecretChange(0, "value", value);
  //   }
  // };

  const handleAddSecrets = async () => {
    if (newSecrets.length === 0) return;

    setIsSubmitting(true);
    try {
      const validSecrets = newSecrets.filter(
        (secret) => secret.key.trim() && secret.value.trim()
      );

      if (validSecrets.length === 0) {
        toast.error("Please add at least one valid secret");
        return;
      }

      await api.post(
        `/api/${workspaceSlug}/${projectSlug}/secrets?environment=${selectedEnvironment}`,
        { secrets: validSecrets }
      );

      // Invalidate the secrets query to trigger a refetch
      queryClient.invalidateQueries({
        queryKey: ["secrets", workspaceSlug, projectSlug, selectedEnvironment],
      });

      await mutateAsync();
      resetState();
      toast.success(`Added ${validSecrets.length} secrets successfully`);

      // Close the dialog
      setIsOpen(false);
    } catch (error) {
      console.error("Error adding secrets:", error);
      toast.error("Failed to add secrets. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveSecret = (index: number) => {
    // omoo: this func remove and rearrange the index back in order
    const filteredSecrets = newSecrets
      .filter((secret) => secret.index != index)
      .map((secret, newIndex) => ({
        ...secret,
        index: newIndex,
      }));

    setNewSecrets(filteredSecrets);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(state) => {
        setIsOpen(state);
        // !state && resetState();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Secrets</DialogTitle>
          <DialogDescription>
            Enter secrets key and value or paste .env content.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-y-4">
          <div className="space-y-2">
            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {newSecrets.map((secret) => {
                const index = secret.index;
                return (
                  <div key={index} className="flex items-center gap-x-2">
                    <Input
                      onPaste={handleKeyPaste}
                      value={secret.key}
                      onChange={(e) =>
                        handleSecretChange(index, "key", e.target.value)
                      }
                      placeholder="KEY"
                    />
                    <Input
                      value={secret.value}
                      onPaste={handleKeyPaste}
                      onChange={(e) =>
                        handleSecretChange(index, "value", e.target.value)
                      }
                      placeholder="VALUE"
                    />
                    <button onClick={() => handleRemoveSecret(secret.index)}>
                      <Trash color="red" size={18} />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 items-center">
              <Button
                variant="outline"
                className="mt-2 text-sm py-1"
                onClick={() => handleAddNew()}
              >
                <Plus size={14} className="mr-2" />
                Add another secret
              </Button>
              <Button
                variant="destructive"
                className="mt-2 text-sm py-1"
                onClick={() => resetState()}
              >
                <Plus size={14} className="mr-2" />
                Clear All
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-start mt-6 flex items-center gap-x-3">
          <Button
            onClick={handleAddSecrets}
            disabled={newSecrets.length === 0 || isSubmitting}
            isLoading={isSubmitting || secretsLoading}
          >
            {isSubmitting
              ? "Adding Secrets..."
              : newSecrets.length > 0
                ? `Add ${newSecrets.length} Secrets`
                : "Add Secret"}
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="outline" ref={closeButtonRef}>
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
