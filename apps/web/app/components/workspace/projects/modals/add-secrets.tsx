import { useState, useRef } from "react";
import { Plus } from "lucide-react";
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

interface Secret {
  key: string;
  value: string;
}

interface AddSecretsDialogProps {
  workspaceSlug: string;
  projectSlug: string;
  selectedEnvironment: string;
}

export default function AddSecretsDialog({
  workspaceSlug,
  projectSlug,
  selectedEnvironment,
}: AddSecretsDialogProps) {
  const [newSecrets, setNewSecrets] = useState<Secret[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const parseEnvContent = (content: string) => {
    const lines = content.split("\n").filter((line) => line.trim());
    const parsedSecrets = lines
      .map((line) => {
        const [key, ...valueParts] = line.split("=").map((part) => part.trim());
        const value = valueParts.join("=").trim();
        return { key, value };
      })
      .filter((secret) => secret.key && secret.value);

    if (parsedSecrets.length > 0) {
      setNewSecrets(parsedSecrets);
      toast.success(`Parsed ${parsedSecrets.length} secrets from clipboard`);
    }
  };

  const handleKeyPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedContent = e.clipboardData.getData("text");
    parseEnvContent(pastedContent);
  };

  const handleSecretChange = (
    index: number,
    field: keyof Secret,
    value: string
  ) => {
    const updatedSecrets = [...newSecrets];
    updatedSecrets[index] = { ...updatedSecrets[index], [field]: value };
    setNewSecrets(updatedSecrets);
  };

  const handleAddNew = () => {
    if (newSecrets.length === 0) {
      const firstKey = document.querySelector(
        'input[placeholder="KEY"]'
      ) as HTMLInputElement;
      const firstValue = document.querySelector(
        'input[placeholder="VALUE"]'
      ) as HTMLInputElement;
      if (firstKey?.value || firstValue?.value) {
        setNewSecrets([
          { key: firstKey?.value || "", value: firstValue?.value || "" },
          { key: "", value: "" },
        ]);
        return;
      }
    }
    setNewSecrets([...newSecrets, { key: "", value: "" }]);
  };

  const handleFirstKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (newSecrets.length === 0) {
      setNewSecrets([{ key: value, value: "" }]);
    } else {
      handleSecretChange(0, "key", value);
    }
  };

  const handleFirstValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (newSecrets.length === 0) {
      setNewSecrets([{ key: "", value }]);
    } else {
      handleSecretChange(0, "value", value);
    }
  };

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

      setNewSecrets([]);
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
    setNewSecrets(newSecrets.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
              {newSecrets.length > 0 ? (
                newSecrets.map((secret, index) => (
                  <div key={index} className="flex items-center gap-x-2">
                    <Input
                      value={secret.key}
                      onChange={(e) =>
                        handleSecretChange(index, "key", e.target.value)
                      }
                      placeholder="KEY"
                    />
                    <Input
                      value={secret.value}
                      onChange={(e) =>
                        handleSecretChange(index, "value", e.target.value)
                      }
                      placeholder="VALUE"
                    />
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-x-2">
                  <Input
                    placeholder="KEY"
                    onPaste={handleKeyPaste}
                    onChange={handleFirstKeyChange}
                  />
                  <Input
                    placeholder="VALUE"
                    onChange={handleFirstValueChange}
                  />
                </div>
              )}
            </div>

            <Button
              variant="outline"
              className="mt-2 text-sm py-1"
              onClick={handleAddNew}
            >
              <Plus size={14} className="mr-2" />
              Add another secret
            </Button>
          </div>
        </div>
        <DialogFooter className="sm:justify-start mt-6 flex items-center gap-x-3">
          <Button
            onClick={handleAddSecrets}
            disabled={newSecrets.length === 0 || isSubmitting}
            isLoading={isSubmitting}
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
