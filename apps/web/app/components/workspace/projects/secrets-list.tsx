import { Loader2 } from "lucide-react";
import Secret from "~/components/workspace/projects/secret";
import { Secret as SecretType } from "~/hooks/useSecrets";

interface SecretsListProps {
  secrets: SecretType[];
  isLoading: boolean;
}

export default function SecretsList({ secrets, isLoading }: SecretsListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-80">
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-7 secrets-list">
      {secrets.map((secret) => (
        <Secret key={secret.id} secret={secret} />
      ))}
    </div>
  );
}
